import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

export type BrandDocument = HydratedDocument<Brand>;
@Schema({ timestamps: true })
export class Brand extends Document {
  @Prop({ unique: true, required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  logo: string;

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

export const BrandSchema = SchemaFactory.createForClass(Brand);
