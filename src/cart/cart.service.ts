import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Bundle } from '../bundles/entities/bundle.entity';
import { Student } from 'src/students/entities/student.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Bundle)
    private readonly bundleRepository: Repository<Bundle>,
    private readonly dataSource: DataSource,
  ) {}

  async addBundleToCart(
    parentId: number,
    bundleId: number,
    quantity: number = 1,
    studentId: number,
  ): Promise<Cart> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if bundle exists first
      const bundle = await queryRunner.manager.findOne(Bundle, {
        where: { id: bundleId },
      });
      const student = await queryRunner.manager.findOne(Student, {
        where: { id: studentId },
      });

      if (!bundle) {
        throw new NotFoundException(`Bundle with ID ${bundleId} not found`);
      }

      if (!student) {
        throw new NotFoundException(`Student not found`);
      }

      // Get or create cart
      let cart = await queryRunner.manager.findOne(Cart, {
        where: { parentId },
        relations: ['items', 'items.bundle', 'items.student'],
      });

      if (!cart) {
        // Create new cart
        cart = queryRunner.manager.create(Cart, { parentId });
        cart = await queryRunner.manager.save(Cart, cart);
      }

      // Check if the same bundleId exists for the same studentId
      let cartItem = await queryRunner.manager.findOne(CartItem, {
        where: { cartId: cart.id, bundleId, studentId }, // Added studentId check
      });

      if (cartItem) {
        // Ensure that the quantity update is explicit
        cartItem.quantity = quantity;
        await queryRunner.manager.save(CartItem, cartItem);
      } else {
        // Create new cart item if bundleId is same but studentId is different
        cartItem = queryRunner.manager.create(CartItem, {
          cartId: cart.id,
          bundleId,
          quantity,
          price: bundle.totalPrice,
          bundle: bundle,
          studentId,
          student,
        });
        await queryRunner.manager.save(CartItem, cartItem);
      }

      // Get final cart state within transaction
      const updatedCart = await queryRunner.manager.findOne(Cart, {
        where: { id: cart.id },
        relations: ['items', 'items.bundle', 'items.student'],
      });

      // Commit transaction
      await queryRunner.commitTransaction();
      return updatedCart;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCart(parentId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { parentId },
      relations: ['items', 'items.bundle', 'items.student'],
    });

    if (!cart) {
      throw new NotFoundException(`Cart not found for parent ${parentId}`);
    }

    // Ensure items are loaded
    await cart.items;
    return cart;
  }

  async removeFromCart(parentId: number, bundleId: number): Promise<Cart> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get cart with items
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { parentId },
        relations: ['items'],
      });
      if (!cart) {
        throw new NotFoundException(`Cart not found for parent ${parentId}`);
      }

      // Get cart items
      const items = await cart.items;
      const cartItem = items?.find((item) => item.bundleId == bundleId);

      if (!cartItem) {
        throw new NotFoundException(
          `Bundle with ID ${bundleId} not found in cart`,
        );
      }

      // Delete the cart item
      await queryRunner.manager.delete(CartItem, { id: cartItem.id });

      // Get updated cart
      const updatedCart = await queryRunner.manager.findOne(Cart, {
        where: { id: cart.id },
        relations: ['items', 'items.bundle', 'items.student'],
      });

      await queryRunner.commitTransaction();
      return updatedCart;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
