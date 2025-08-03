import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Order, OrderStatus, TransactionStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '../payments/entities/payment.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { BulkUpdateTransactionStatusDto } from './dto/bulk-update-transaction-status.dto';
import { BulkUpdateOrderStatusDto } from './dto/bulk-update-order-status.dto';
import { SettingsService } from 'src/settings/settings.service';
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly dataSource: DataSource,
    private readonly settingsService: SettingsService,
  ) {}

  SHIPPING_HOME: string = 'home';
  SHIPPING_HOME_COST: number = 500;

  async placeOrderFromCart(
    parentId: number,
    shippingMethod: string,
    paymentMethod: PaymentMethod,
    isAddressEdited: boolean,
    deliveryAddress: string,
  ): Promise<Order> {
    const settings = await this.settingsService.getSettings();
    if (!settings.settings.enablePurchasing) {
      return {
        success: false,
        message: 'Purchasing is currently disabled',
      } as any
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get parent's cart with items and bundles
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { parentId },
        relations: ['items', 'items.bundle', 'items.student'],
      });

      if (!cart) {
        throw new NotFoundException(`Cart not found for parent ${parentId}`);
      }

      const cartItems = await cart.items;
      if (!cartItems || cartItems.length === 0) {
        throw new NotFoundException('Cart is empty');
      }

      // Calculate total price from cart items
      let totalPrice = cartItems.reduce(
        (sum, item) => sum + item.bundle.totalPrice * item.quantity,
        0,
      );

      if (shippingMethod === this.SHIPPING_HOME)
        totalPrice += this.SHIPPING_HOME_COST; //adding shipping cost if user want item to be delivered at home

      // Create order
      const order = queryRunner.manager.create(Order, {
        parentId,
        totalPrice,
        isAddressEdited,
        deliveryAddress,
        shippingMethod,
        status: OrderStatus.IN_PROGRESS,
        transactionStatus: TransactionStatus.FAILED,
      });
      const savedOrder = await queryRunner.manager.save(Order, order);

      // Transform cart items to order items
      for (const cartItem of cartItems) {
        const orderItem = queryRunner.manager.create(OrderItem, {
          orderId: parseInt(savedOrder.id),
          bundleId: cartItem.bundleId,
          quantity: cartItem.quantity,
          unitPrice: cartItem.bundle.totalPrice,
          studentId: cartItem.studentId,
        });
        await queryRunner.manager.save(OrderItem, orderItem);
      }

      // Create payment
      const payment = queryRunner.manager.create(Payment, {
        orderId: parseInt(savedOrder.id),
        amount: totalPrice,
        paymentMethod: PaymentMethod.DIRECT,
        paymentStatus: PaymentStatus.FAILED,
      });
      await queryRunner.manager.save(Payment, payment);

      // Clear the cart
      //await queryRunner.manager.delete(CartItem, { cartId: cart.id });

      // Get complete order with relations
      const completeOrder = await queryRunner.manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ['items', 'items.bundle', 'payments', 'items.student'],
      });

      await queryRunner.commitTransaction();
      return completeOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const orders = await this.orderRepository.find({
      relations: [
        'parent',
        'items',
        'items.bundle',
        'items.student',
        'payments',
      ],
      order: {
        createdAt: 'DESC',
      },
    });

    if (!orders.length) {
      throw new NotFoundException('No orders found');
    }

    return orders;
  }

  async findByParentId(parentId: string) {
    const orders = await this.orderRepository.find({
      where: { parentId: parseInt(parentId) },
      relations: ['items', 'items.bundle', 'items.student'],
      order: {
        createdAt: 'DESC',
      },
    });

    if (!orders.length) {
      throw new NotFoundException('No orders found for this parent');
    }

    return {
      success: true,
      message: 'Orders retrieved successfully',
      orders,
    };
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.bundle', 'items.student'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Update order status
    order.status = updateOrderStatusDto.status;
    order.trackingId = updateOrderStatusDto.trackingId;
    // Save the updated order
    const updatedOrder = await this.orderRepository.save(order);

    return {
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder,
    };
  }

  async bulkUpdateStatus(bulkUpdateDto: BulkUpdateOrderStatusDto) {
    const results = {
      success: true,
      message: 'Bulk order status update completed',
      successCount: 0,
      failedCount: 0,
      details: []
    };

    const orderIds = bulkUpdateDto.transactions.map(o => o.orderId);
    
    try {
      const orders = await this.orderRepository.find({
        where: { id: In(orderIds) }
      });
      
      const orderMap = new Map();
      orders.forEach(order => {
        orderMap.set(order.id, order);
      });
      
      const ordersToUpdate = [];
      
      for (const orderUpdate of bulkUpdateDto.transactions) {
        const orderId = Number(orderUpdate.orderId);
        const order = orderMap.get(orderId);

        if (!order) {
          results.failedCount++;
          results.details.push({
            orderId: orderUpdate.orderId,
            success: false,
            message: `Order with ID ${orderUpdate.orderId} not found`
          });
          continue;
        }

        if (orderUpdate?.status !== undefined) {
          order.status = orderUpdate.status;
        }
        if (orderUpdate?.trackingId !== undefined) {
          order.trackingId = orderUpdate.trackingId;
        }

        ordersToUpdate.push(order);

        results.successCount++;
        results.details.push({
          orderId: orderUpdate.orderId,
          success: true,
          message: "Order status updated successfully"
        });
      }
      
      if (ordersToUpdate.length > 0) {
        await this.orderRepository.save(ordersToUpdate);
      }
    } catch (error) {
      results.success = false;
      results.message = `Bulk update failed: ${error.message}`;
    }
    
    // Update overall results message
    if (results.failedCount === bulkUpdateDto.transactions.length) {
      results.success = false;
      results.message = 'All order status updates failed';
    } else if (results.failedCount > 0) {
      results.message = `Completed with ${results.successCount} successful and ${results.failedCount} failed updates`;
    }
    
    return results;
  }

  async updateTransactionStatus(id: string, updateTransactionStatusDto: UpdateTransactionStatusDto) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.bundle', 'items.student'],
    });

    const payment = await this.paymentRepository.findOne({
      where: { orderId: parseInt(id) },
      order: { createdAt: 'DESC' },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (!payment) {
      throw new NotFoundException(`Payment with order ID ${id} not found`);
    }

    // Update order status
    order.transactionStatus = updateTransactionStatusDto.status;
    order.settlement_status = updateTransactionStatusDto.settlement_status;
    payment.status = updateTransactionStatusDto.status as any;
    payment.applicationCode = updateTransactionStatusDto.application_code;

    // Save the updated order
    const updatedOrder = await this.orderRepository.save(order);
    const updatedPayment = await this.paymentRepository.save(payment);
    return {
      success: true,
      message: 'Transaction status updated successfully',
      order: updatedOrder,
      payment: updatedPayment,
    };
  }

  async bulkUpdateTransactionStatus(bulkUpdateDto: BulkUpdateTransactionStatusDto) {
    const results = {
      success: true,
      message: 'Bulk update completed',
      successCount: 0,
      failedCount: 0,
      details: []
    };

    const orderIds = bulkUpdateDto.transactions.map(t => t.orderId);
    
    try {
      // Get all orders in one query
      const orders = await this.orderRepository.find({
        where: { id: In(orderIds) }
      });
      
      // Get all payments in one query
      const payments = await this.paymentRepository.find({
        where: { orderId: In(orderIds) }
      });
      
      const orderMap = new Map();
      orders.forEach(order => {
        orderMap.set(order.id, order);
      });
      
      const paymentMap = new Map();
      payments.forEach(payment => {
        paymentMap.set(payment.orderId, payment);
      });
      
      // Prepare batch updates
      const ordersToUpdate = [];
      const paymentsToUpdate = [];
      
      // Process each transaction
      for (const transaction of bulkUpdateDto.transactions) {
        const orderId = Number(transaction.orderId);
        
        const order = orderMap.get(orderId);
        const payment = paymentMap.get(orderId);

        if (!order || !payment) {
          results.failedCount++;
          results.details.push({
            orderId: transaction.orderId,
            success: false,
            message: !order
              ? `Order with ID ${transaction.orderId} not found`
              : `Payment with order ID ${transaction.orderId} not found`,
          });
          continue;
        }

        // Update order status
        if (transaction?.status !== undefined) {
          order.transactionStatus = transaction.status;
          payment.status = transaction.status as any;
        }
        if (transaction?.settlement_status !== undefined) {
          order.settlement_status = transaction.settlement_status;
        }
        if (transaction?.application_code !== undefined) {
          payment.applicationCode = transaction.application_code;
        }

        // Add to batch update arrays
        ordersToUpdate.push(order);
        paymentsToUpdate.push(payment);

        results.successCount++;
        results.details.push({
          orderId: transaction.orderId,
          success: true,
          message: "Transaction status updated successfully",
        });
      }
      
      // Execute batch updates if there are items to update
      if (ordersToUpdate.length > 0) {
        await this.orderRepository.save(ordersToUpdate);
      }
      
      if (paymentsToUpdate.length > 0) {
        await this.paymentRepository.save(paymentsToUpdate);
      }
    } catch (error) {
      results.success = false;
      results.message = `Bulk update failed: ${error.message}`;
    }
    
    // If all transactions failed, change the overall success status
    if (results.failedCount === bulkUpdateDto.transactions.length) {
      results.success = false;
      results.message = 'All transaction updates failed';
    } else if (results.failedCount > 0) {
      results.message = `Completed with ${results.successCount} successful and ${results.failedCount} failed updates`;
    }
    
    return results;
  }
}
