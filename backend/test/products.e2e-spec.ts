import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsController } from './../src/products/products.controller';
import { ProductsService } from './../src/products/products.service';
import { Product } from './../src/products/entities/product.entity';

describe('ProductsController (e2e) - creación y actualización', () => {
  let app: INestApplication<App>;

  const PRODUCT_ID = 'a1b2c3d4-0000-0000-0000-000000000000';
  const FARMER_ID = '9f8c1a2b-3c4d-4e5f-8a9b-0c1d2e3f4a5b';

  const existingProduct: Partial<Product> = {
    id: PRODUCT_ID,
    farmer_id: FARMER_ID,
    name: 'Queso Campesino',
    category: 'Quesos',
    description: 'Queso artesanal',
    image_url: 'https://example.com/queso.jpg',
    price: 25000,
    stock: 12,
  };

  const mockProductRepository = {
    create: jest.fn((dto: Partial<Product>) => ({ ...dto })),
    merge: jest.fn((entity: Partial<Product>, dto: Partial<Product>) => ({
      ...entity,
      ...dto,
    })),
    findOne: jest.fn(() => Promise.resolve({ ...existingProduct })),
    find: jest.fn(() => Promise.resolve([{ ...existingProduct }])),
    save: jest.fn((product: Partial<Product>) =>
      Promise.resolve({
        id: PRODUCT_ID,
        created_at: new Date('2026-01-01T00:00:00.000Z'),
        ...product,
      } as Product),
    ),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Misma configuración de validación que en src/main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe guardar category e image_url sin perderlos (regresión de NULL)', async () => {
    // Payload tal cual lo envía frontend/src/pages/PublishProduct.tsx
    const payload = {
      name: 'Leche Fresca',
      category: 'Leche Fresca',
      description: 'Leche de vaca',
      price: 3200,
      stock: 40,
      image_url: 'https://example.com/leche.jpg',
      farmerId: FARMER_ID,
      farmer_id: FARMER_ID,
    };

    const response = await request(app.getHttpServer())
      .post('/products')
      .send(payload)
      .expect(201);

    expect(response.body).toMatchObject({
      name: 'Leche Fresca',
      category: 'Leche Fresca',
      image_url: 'https://example.com/leche.jpg',
      farmer_id: FARMER_ID,
    });

    // Lo que realmente llega a TypeORM no puede tener category/image_url en NULL
    const savedProduct = mockProductRepository.save.mock.calls[0][0];
    expect(savedProduct.category).toBe('Leche Fresca');
    expect(savedProduct.image_url).toBe('https://example.com/leche.jpg');
  });

  it('debe mapear la entidad enviada al repositorio de forma explícita', async () => {
    const payload = {
      name: 'Yogur',
      category: 'Yogures y Kumis',
      price: 5000,
      stock: 10,
      image_url: 'https://example.com/yogur.jpg',
      farmer_id: FARMER_ID,
    };

    await request(app.getHttpServer()).post('/products').send(payload).expect(201);

    const createdEntity = mockProductRepository.create.mock.calls[0][0];
    expect(createdEntity).toEqual({
      name: 'Yogur',
      description: undefined,
      price: 5000,
      stock: 10,
      farmer_id: FARMER_ID,
      category: 'Yogures y Kumis',
      image_url: 'https://example.com/yogur.jpg',
    });
  });

  it('debe actualizar un producto conservando los campos no enviados', async () => {
    const payload = {
      name: 'Queso Campesino Premium',
      category: 'Quesos',
      price: 30000,
      stock: 8,
    };

    const response = await request(app.getHttpServer())
      .patch(`/products/${PRODUCT_ID}`)
      .send(payload)
      .expect(200);

    expect(response.body).toMatchObject({
      name: 'Queso Campesino Premium',
      category: 'Quesos',
      price: 30000,
      stock: 8,
    });

    // image_url no venía en el payload: no debe borrarse
    expect(response.body.image_url).toBe('https://example.com/queso.jpg');
  });

  it('debe responder 404 al actualizar un producto inexistente', async () => {
    mockProductRepository.findOne.mockResolvedValueOnce(null);

    await request(app.getHttpServer())
      .patch('/products/00000000-0000-0000-0000-000000000000')
      .send({ name: 'No existe' })
      .expect(404);

    expect(mockProductRepository.save).not.toHaveBeenCalled();
  });

  it('debe filtrar por category en el listado', async () => {
    await request(app.getHttpServer())
      .get('/products?category=Quesos')
      .expect(200);

    expect(mockProductRepository.find).toHaveBeenCalledWith({
      where: { category: 'Quesos' },
    });
  });
});
