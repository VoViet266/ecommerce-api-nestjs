import { IsNotEmpty, IsString } from 'class-validator';
import {
  Camera,
  Connectivity,
  Specifications,
  Variant,
} from '../schemas/product.schemas';

export class CreateProductDto {
  @IsNotEmpty()
  name: string;
  description: string;
 
  @IsNotEmpty()
  discount: number;
  stock: number;
  specifications: Specifications;
  camera: Camera;
  connectivity: Connectivity;
  variant: Variant[];
  @IsNotEmpty()
  categoryId: string[];
  @IsNotEmpty()
  brandId: string[];
  images: string[];
}
