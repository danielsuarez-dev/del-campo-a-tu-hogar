import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false, // Se mantendrá en false para manejar el esquema vía DDL SQL
      ssl: {
        rejectUnauthorized: false, // Requerido para la conexión segura con Supabase
      },
    }),
    UsersModule,
    ProductsModule,
    OrdersModule,
    AuthModule,
  ],
})
export class AppModule {}