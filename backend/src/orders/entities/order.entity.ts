import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  user_id: string | null;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;
}
