import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument, Types } from 'mongoose';
import {
  Product,
  Variant,
  VariantSchema,
} from 'src/product/schemas/product.schemas';
import { User } from 'src/user/schemas/user.schemas';

export type CartDocument = HydratedDocument<Cart>;
@Schema({
  timestamps: true,
})
export class Cart extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop([
    {
      _id: false,
      productId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: Product.name,
      },
      name: { type: String, required: true }, // Tên sản phẩm
      quantity: { type: Number, required: true }, // Số lượng sản phẩm
      variant: { type: VariantSchema, require: true }, // Biến thể sản phẩm
      price: { type: Number, required: true }, // Giá lúc thêm vào giỏ hàng
    },
  ])
  products: {
    productId: Types.ObjectId;
    name: string;
    quantity: number;
    variant: Variant;
    price: number;
  }[];

  @Prop({ type: Number, required: true })
  totalPrice: number;

  @Prop()
  createdAt: Date;

  @Prop({
    type: Object,
  })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };
  @Prop()
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
