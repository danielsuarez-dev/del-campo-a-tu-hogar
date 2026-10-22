import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateProductDto {
  @IsUUID()
  @IsOptional()
  farmer_id?: string;

  // Alias en camelCase: el ValidationPipe usa `whitelist: true`, así que sin
  // esta declaración el campo sería eliminado del payload antes del mapeo.
  @IsUUID()
  @IsOptional()
  farmerId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  // Alias en camelCase (misma razón que `farmerId`).
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  stock: number;
}
