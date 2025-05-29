import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { Payment, PaymentStatus } from './entities/payment.entity';
import { Order, TransactionStatus } from '../orders/entities/order.entity';
import { PaymentEventDto } from './dto/payment-event.dto';
import { PaymentClosedDto } from './dto/payment-closed.dto';
import { GetPaymentConfigDto } from './dto/get-payment-config.dto';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { Size } from '../sizes/entities/size.entity';
import { Parent } from '../parents/entities/parent.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment) private payRepo: Repository<Payment>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Size) private sizeRepo: Repository<Size>,
    @InjectRepository(Parent) private parentRepo: Repository<Parent>,
    private ds: DataSource,
    private http: HttpService,
  ) {}

  async getConfig(orderId: string): Promise<GetPaymentConfigDto> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['parent'],
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    if (!order.parent.parentName)
      throw new NotFoundException(`Parent details not found`);

    const orderItems = await this.orderItemRepo.findOne({
      where: { orderId: Number(order.id) },
      relations: ['student'],
    });

    if (!orderItems.student || !orderItems.student.usid) {
      throw new NotFoundException('No student USID found for this parent');
    }

    return {
      env: process.env.GQ_ENV,
      auth: {
        client_id: process.env.GQ_CLIENT_ID,
        client_secret: process.env.GQ_CLIENT_SECRET,
        api_key: process.env.GQ_API_KEY,
      },
      student_id: orderItems.student.usid,
      reference_id: orderId,
      student_details: {
        student_first_name: orderItems.student.studentName,
      },
      customer_details: {
        customer_first_name: order.parent.parentName,
        customer_email: `${orderItems.student.usid}@grayquest.com`,
      },
      fee_headers: {
        current_payable: order.totalPrice,
      },
      pp_config: { slug: process.env.GQ_SDK_SLUG },
    };
  }

  async getPaymentByOrderId(orderId: string): Promise<any> {
    const payment = await this.payRepo.findOne({
      where: { order: { id: orderId } },
      relations: ['order', 'order.parent'],
    });
    
    if (!payment) {
      throw new NotFoundException(`Payment for order ${orderId} not found`);
    }
    
    // Process raw data to include product names and sizes
    if (payment.raw && payment.raw.cartItems) {
      const processedCartItems = await Promise.all(
        payment.raw.cartItems.map(async (cartItem) => {
          if (cartItem.bundle && cartItem.bundle.bundleProducts) {
            const processedBundleProducts = await Promise.all(
              cartItem.bundle.bundleProducts.map(async (bundleProduct) => {
                // Fetch product details
                const product = await this.productRepo.findOne({
                  where: { id: bundleProduct.productId }
                });
                
                // Fetch size details
                const size = await this.sizeRepo.findOne({
                  where: { 
                    productId: bundleProduct.productId,
                    studentId: cartItem.studentId 
                  }
                });
                
                return {
                  ...bundleProduct,
                  product: product ? {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                  } : null,
                  size: size ? {
                    id: size.id,
                    size: size.size
                  } : null
                };
              })
            );
            
            return {
              ...cartItem,
              bundle: {
                ...cartItem.bundle,
                bundleProducts: processedBundleProducts
              }
            };
          }
          return cartItem;
        })
      );
      
      return {
        ...payment,
        raw: {
          ...payment.raw,
          cartItems: processedCartItems
        }
      };
    }
    
    return payment;
  }

  async markPaid(evt: PaymentEventDto) {
    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const pay = (await qr.manager.findOne(Payment, {
        where: { order: { id: evt.order_code } },
        relations: ['order'],
      })) as Payment;
      if (!pay) throw new NotFoundException(`Payment ${evt.order_code}`);

      pay.status = PaymentStatus.PAID;
      pay.externalReference = evt.bank_reference_id;
      pay.raw = evt;
      pay.applicationCode = evt.application_code;
      await qr.manager.save(pay);

      pay.order.transactionStatus = TransactionStatus.PAID;
      await qr.manager.save(pay.order);

      // Clear the cart after successful payment
      const cart = await qr.manager.findOne(Cart, {
        where: { parentId: pay.order.parentId },
      });
      if (cart) {
        await qr.manager.delete(CartItem, { cartId: cart.id });
      }
      await qr.commitTransaction();
      this.sendSms(evt.cartItems, true);
      return { success: true };
    } catch (err) {
      await qr.rollbackTransaction();
      this.logger.error('markPaid failed', err.stack);
      throw err;
    } finally {
      await qr.release();
    }
  }

  async markFailed(evt: PaymentEventDto) {
    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const pay = await qr.manager.findOne(Payment, {
        where: { order: { id: evt.order_code } },
        relations: ['order'],
      });
      if (!pay) throw new NotFoundException(`Payment ${evt.order_code}`);

      pay.status = PaymentStatus.FAILED;
      pay.raw = evt;
      pay.applicationCode = evt.application_code || null;
      await qr.manager.save(pay);

      pay.order.transactionStatus = TransactionStatus.FAILED;
      await qr.manager.save(pay.order);

      await qr.commitTransaction();
      this.sendSms(evt.cartItems, false);
      return { success: false };
    } catch (err) {
      await qr.rollbackTransaction();
      this.logger.error('markFailed failed', err.stack);
      throw err;
    } finally {
      await qr.release();
    }
  }

  async markClosed(evt: PaymentClosedDto) {
    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const pay = await qr.manager.findOne(Payment, {
        where: { order: { id: evt.order_code } },
        relations: ['order'],
      });
      if (!pay) throw new NotFoundException(`Payment ${evt.order_code}`);

      pay.status = PaymentStatus.FAILED;
      pay.raw = evt;
      pay.event = evt.event;
      await qr.manager.save(pay);

      pay.order.transactionStatus = TransactionStatus.FAILED;
      await qr.manager.save(pay.order);

      await qr.commitTransaction();
      return { success: true };
    } catch (err) {
      await qr.rollbackTransaction();
      this.logger.error('markClosed failed', err.stack);
      throw err;
    } finally {
      await qr.release();
    }
  }

  async sendSms(cartItems, isSuccess: boolean) {
    cartItems?.forEach(async (item) => {
      console.log(item,'item****');
      let phoneNumber;
      
      if (item.student?.usid) {
        // Using a raw query with ANY operator to search in the students array
        const parent = await this.parentRepo
          .createQueryBuilder('parent')
          .where(`'${item.student.usid}' = ANY(parent.students)`)
          .getOne();
        
        if (parent) {
          phoneNumber = parent.phoneNumber;
        } else {
          this.logger.warn(`Parent not found for student USID: ${item.student.usid}`);
          return;
        }
      } else {
        return;
      }
      
      // Create SMS text with explicit newlines that will work with SMS gateways
      const messageLines = [
        "Dear Parent,",
        "",
        isSuccess ? "Your order has been placed successfully!" : "Your order was unsuccessful/cancelled.",
        "",
        `Student Name: ${item.student?.studentName}`,
        `USID: ${item.student?.usid}`,
        `Company: Thathva Industries`,
        "",
        isSuccess ? `Thank you for the purchase. Your product will be delivered soon.` : `Please check your payment details or try again.`,
        "",
        "Regards,",
        "Team Thathva"
      ];
      
      // Join with %0A which is the URL-encoded newline character
      const smsText = messageLines.join("%0A");
      
      const smsUrl = `http://sms.teleosms.com/api/mt/SendSMS?APIKey=${process.env.SMS_API_KEY}&senderid=THATVA&channel=Trans&DCS=0&flashsms=0&number=91${phoneNumber}&text=${smsText}&route=2`;
      
      await this.http.axiosRef.get(smsUrl).then((res)=>{
        console.log(smsUrl,res.data,'res***');
      });
    });
  }
}