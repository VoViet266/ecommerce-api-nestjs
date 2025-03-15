import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Gender } from 'src/constant/gender.enum';
import { Role } from 'src/role/Schemas/role.schemas';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  phone: string;

  @Prop()
  avatar: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  age: number;

  @Prop()
  gender: Gender;

  @Prop()
  address: string;

  @Prop()
  refreshToken: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: Role.name,
    default: ['677cfbb7811cbee760e7a86a'],
  })
  roleID: mongoose.Types.ObjectId[];
  @Prop()
  resetPasswordToken: string;

  @Prop()
  resetPasswordExpires: Date;
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

export const UserSchema = SchemaFactory.createForClass(User);
