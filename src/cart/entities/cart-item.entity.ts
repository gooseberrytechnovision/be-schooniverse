import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Bundle } from '../../bundles/entities/bundle.entity';
import { Student } from 'src/students/entities/student.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('Cart', 'items')
  @JoinColumn({ name: 'cart_id' })
  cart: Promise<any>;

  @Column({ name: 'cart_id' })
  cartId: number;

  @ManyToOne(() => Bundle)
  @JoinColumn({ name: 'bundle_id' })
  bundle: Bundle;

  @Column({ name: 'bundle_id' })
  bundleId: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;
  CartItem: any;
}
