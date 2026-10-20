import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../users/dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    // UsersService.login valida las credenciales (bcrypt) y devuelve el
    // usuario sin el password, o lanza UnauthorizedException.
    const user = await this.usersService.login(loginUserDto);

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }
}
