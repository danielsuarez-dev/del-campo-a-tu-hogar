import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { user_id, items } = createOrderDto;

    return await this.dataSource.transaction(async (manager) => {
      const orderItems: OrderItem[] = [];
      let total = 0;

      for (const item of items) {
        const product = await manager.findOne(Product, {
          where: { id: item.product_id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new NotFoundException(
            `Producto ${item.product_id} no encontrado`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, solicitado: ${item.quantity}`,
          );
        }

        product.stock -= item.quantity;
        await manager.save(product);

        const unitPrice = Number(product.price);
        total += unitPrice * item.quantity;

        orderItems.push(
          manager.create(OrderItem, {
            product_id: product.id,
            quantity: item.quantity,
            unit_price: unitPrice,
          }),
        );
      }

      const order = manager.create(Order, {
        user_id,
        status: 'pending',
        total: Math.round(total * 100) / 100,
        items: orderItems,
      });

      return await manager.save(order);
    });
  }

  async findAll() {
    return await this.dataSource.getRepository(Order).find({
      relations: { items: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const order = await this.dataSource.getRepository(Order).findOne({
      where: { id },
      relations: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Orden ${id} no encontrada`);
    }

    return order;
  }
}
