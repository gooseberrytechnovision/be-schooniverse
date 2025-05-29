import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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

  async updateTransactionStatus(id: string, updateTransactionStatusDto: UpdateTransactionStatusDto) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.bundle', 'items.student'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Update order status
    order.transactionStatus = updateTransactionStatusDto.status;

    // Save the updated order
    const updatedOrder = await this.orderRepository.save(order);

    return {
      success: true,
      message: 'Transaction status updated successfully',
      order: updatedOrder,
    };
  }
}
