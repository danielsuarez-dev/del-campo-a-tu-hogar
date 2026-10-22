import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    // Mapeo explícito: solo se envían a TypeORM los campos que el DTO
    // reconoce. Evita que columnas como `category` o `image_url` terminen
    // en NULL por cualquier propiedad no mapeada del payload original.
    const newProduct = this.productsRepository.create({
      name: createProductDto.name,
      description: createProductDto.description,
      price: createProductDto.price,
      stock: createProductDto.stock,
      farmer_id: createProductDto.farmer_id || createProductDto.farmerId,
      category: createProductDto.category,
      image_url: createProductDto.image_url || createProductDto.imageUrl,
    });
    return await this.productsRepository.save(newProduct);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    // Mapeo explícito también en la actualización: cada campo conserva el
    // valor actual cuando el payload no lo trae, así nunca se pisa con NULL.
    const updatedProduct = this.productsRepository.merge(product, {
      name: updateProductDto.name ?? product.name,
      description: updateProductDto.description ?? product.description,
      price: updateProductDto.price ?? product.price,
      stock: updateProductDto.stock ?? product.stock,
      farmer_id:
        updateProductDto.farmer_id || updateProductDto.farmerId || product.farmer_id,
      category: updateProductDto.category ?? product.category,
      image_url:
        updateProductDto.image_url || updateProductDto.imageUrl || product.image_url,
    });

    return await this.productsRepository.save(updatedProduct);
  }

  async findAll(query?: any) {
    const where: any = {};
    if (query?.farmer_id || query?.farmerId) {
      where.farmer_id = query.farmer_id || query.farmerId;
    }
    if (query?.userId && !where.farmer_id) {
      where.farmer_id = query.userId;
    }
    if (query?.category) {
      where.category = query.category;
    }
    return await this.productsRepository.find({ where });
  }
}
