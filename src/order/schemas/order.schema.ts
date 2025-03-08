import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument, Types } from 'mongoose';
import {
  Product,
  Variant,
  VariantSchema,
} from 'src/product/schemas/product.schemas';
import { User } from 'src/user/schemas/user.schemas';

export type OrderDocument = HydratedDocument<Order>;

@Schema({
  timestamps: true,
})
export class Order {
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: User.name })
  userId: mongoose.Types.ObjectId[];

  @Prop({
    type: [
      {
        productId: { type: Types.ObjectId, required: true, ref: Product.name },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        variant: { type: VariantSchema, required: true },
      },
    ],
    required: true,
  })
  products: {
    productId: Types.ObjectId;
    quantity: number;
    price: number;
    variant: Variant;
  }[];

  @Prop({ type: Number, required: true, default: 0 })
  totalPrice: number;

  @Prop({
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: String, required: true })
  shippingAddress: string;

  @Prop({ type: String, required: true })
  paymentMethod: string;

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

export const OrderSchema = SchemaFactory.createForClass(Order);

// Tính tổng giá các sản phẩm trước khi lưu đơn hàng
// OrderSchema.pre('save', function (next) {
//   const order = this as Order;

//   // Tính tổng giá các sản phẩm
//   order.totalPrice = order.products.reduce((sum, product) => {
//     return sum + product.quantity * product.price;
//   }, 0);

//   next();
// });
// OrderSchema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
//   const update = this.getUpdate();
//   if (update && (update as any).products) {
//     const totalPrice = (update as any).products.reduce(
//       (sum: number, product: { quantity: number; price: number }) => {
//         return sum + product.quantity * product.price;
//       },
//       0,
//     );
//     this.setUpdate({ ...update, totalPrice });
//   }
//   next();
// });
