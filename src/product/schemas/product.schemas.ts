import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Brand } from 'src/brand/schemas/brand.schema';
import { Category } from 'src/category/schemas/category.schemas';

export type ProductDocument = HydratedDocument<Product>;

class Image {
  @Prop({ type: Object })
  main: {
    original_name: string;
    type: string;
    url: string;
  };

  @Prop({ type: Object })
  thumbnail: {
    original_name: string;
    type: string;
    url: string;
  };

  @Prop({ type: [Object] })
  gallery: {
    original_name: string;
    type: string;
    url: string;
  }[];
}

export class Specifications {
  screen: {
    size: string;
    resolution: string;
    technology: string;
  };
  processor: {
    chip: string;
    speed: string;
    gpu: string;
  };
  ram: {
    size: string;
    technology: string;
  };

  storage: {
    size: string;
    technology: string;
  };
  battery: {
    capacity: string;
    technology: string;
  };
  charging: {
    technology: string;
    capacity: string;
  };
  os: string;
  weight: string;
  material: string;
}

export class Camera {
  rear: [{ resolution: string; type: string }];
  video: [{ resolution: string; fps: string }];
  front: [{ resolution: string; type: string }];
  features: string[];
}

export class Connectivity {
  network: string[];
  wifi: string;
  bluetooth: string;
  gps: string;
  nfc: boolean;
  usb: string;
  audio_jack: string;
}

@Schema({ _id: true })
export class Variant {
  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  storage: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: false }) // Có thể thay đổi thành không bắt buộc
  stock: number;

  @Prop({ required: false }) // Có thể thay đổi thành không bắt buộc
  ram: string;
  // id: Variant;
  _id: any;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);
@Schema({ timestamps: true })
export class Product {
  @Prop({ type: String })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: Number })
  stock: number;

  @Prop({ type: Number, default: 0 })
  discount: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Category.name })
  categoryId: mongoose.Types.ObjectId;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: Brand.name })
  brandId: mongoose.Types.ObjectId[];

  @Prop()
  images: Image;

  @Prop()
  specifications: Specifications;

  @Prop()
  camera: Camera;

  @Prop()
  connectivity: Connectivity;

  @Prop({ type: [VariantSchema], _id: true })
  variant: Variant[];

  @Prop()
  createdAt: Date;

  @Prop({ type: Object })
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

export const ProductSchema = SchemaFactory.createForClass(Product);
