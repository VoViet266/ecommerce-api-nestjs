import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { PermissionsEnum } from 'src/constant/permission.enum';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({ timestamps: true })
export class Permission {
  @Prop({ required: true, unique: true, enum: PermissionsEnum })
  name: string; // Tên permission, ví dụ: "READ", "WRITE"

  @Prop({ required: true })
  description: string; // Mô tả quyền

  @Prop({ required: true })
  module: string; // Module của permission, ví dụ: "USER", "POST

  @Prop({ required: true })
  action: string; // Action của permission, ví dụ: "READ", "WRITE"

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
}

export const PermissionsSchemas = SchemaFactory.createForClass(Permission);
