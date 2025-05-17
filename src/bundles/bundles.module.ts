import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BundlesService } from './bundles.service';
import { BundlesController } from './bundles.controller';
import { Bundle } from './entities/bundle.entity';
import { BundleProduct } from './entities/bundle-product.entity';
import { Product } from './entities/product.entity';
import { Student } from '../students/entities/student.entity';
import { ClassCategory } from '../class-categories/entities/class-category.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bundle,
      BundleProduct,
      Product,
      Student,
      ClassCategory,
      OrderItem,
      Order,
    ]),
  ],
  controllers: [BundlesController],
  providers: [BundlesService],
  exports: [BundlesService]
})
export class BundlesModule {} 