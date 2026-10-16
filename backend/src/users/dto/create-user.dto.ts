import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsIn,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsIn(['campesino', 'cliente'])
  role: string;

  @IsString()
  @IsOptional()
  phone?: string;
}