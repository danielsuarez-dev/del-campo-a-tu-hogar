import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    const saved = await this.userRepository.save(user);
    return this.removePassword(saved);
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.removePassword(user);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: string) {
    return await this.userRepository.findOneBy({ id });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...userData } = updateUserDto;

    const data: Partial<User> = { ...userData };
    if (password) {
      data.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    await this.userRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.userRepository.delete(id);
    return { message: `Usuario con ID ${id} eliminado correctamente` };
  }

  private removePassword(user: User) {
    const { password, ...result } = user;
    return result;
  }
}
