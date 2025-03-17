import { Variant } from 'src/product/schemas/product.schemas';

export class CreateCartDto {
  userId: string;
  products: {
    productId: string;
    variant: Variant;
    quantity: number;
    price: number;
  }[];
}
