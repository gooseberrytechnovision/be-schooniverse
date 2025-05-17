import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Size } from '../../sizes/entities/size.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column({ type: 'varchar', length: 255, name: 'image'})
  imageUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 ,name: 'unit_price'})
  price: number;

  @OneToMany(() => Size, (size) => size.product)
  sizes: Size[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 