import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersController } from './../src/users/users.controller';
import { UsersService } from './../src/users/users.service';
import { User } from './../src/users/entities/user.entity';

describe('UsersController (e2e) - POST /users', () => {
  let app: INestApplication<App>;

  const mockUserRepository = {
    create: jest.fn((dto: Partial<User>) => dto),
    save: jest.fn((user: Partial<User>) =>
      Promise.resolve({
        id: 'a1b2c3d4-0000-0000-0000-000000000000',
        created_at: new Date('2026-01-01T00:00:00.000Z'),
        ...user,
      } as User),
    ),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
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

  it('debe crear un usuario con datos válidos y responder 201', async () => {
    const payload = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'secreto123',
      role: 'cliente',
      phone: '3001234567',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(payload)
      .expect(201);

    expect(response.body).toMatchObject({
      id: 'a1b2c3d4-0000-0000-0000-000000000000',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      role: 'cliente',
      phone: '3001234567',
    });

    // La contraseña nunca debe exponerse en la respuesta
    expect(response.body.password).toBeUndefined();
    expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
  });

  it('debe responder 400 cuando falta el password', async () => {
    const payload = {
      name: 'María Sin Clave',
      email: 'maria@example.com',
      role: 'campesino',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(payload)
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([expect.stringContaining('password')]),
    );
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });
});
