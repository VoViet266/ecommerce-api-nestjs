import { Variant } from 'src/product/schemas/product.schemas';

export class CreateOrderDto {
  userId: string;
  products: {
    productId: string;
    quantity: number;
    variant: Variant;
    price: number;
  }[];
  totalPrice: number;
  status: string;
  shippingAddress: string;
  paymentMethod: string;
}
