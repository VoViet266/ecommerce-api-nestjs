import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User as userModel, UserDocument } from './schemas/user.schemas';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './interface/user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(userModel.name)
    private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  // hashPassword function
  hashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };
  async create(createUserDto: CreateUserDto, user: IUser) {
    const hashedPassword = this.hashPassword(createUserDto.password);
    return await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
  }

  async register(user: RegisterUserDto) {
    const { name, email, password, age, gender, address } = user;
    const isExitEmail = await this.userModel.findOne({ email });
    if (isExitEmail) {
      throw new UnauthorizedException(
        `Email: ${email} đã tồn tại trên hệ thống xin vui lòng chọn email khác`,
      );
    }
    const hashedPassword = this.hashPassword(password);

    let newRegister = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      address,
    });
    return newRegister;
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne({ _id }, { refreshToken });
  };
  findOne(id: string) {
    return this.userModel.findOne({ _id: id }).populate('roleID').exec();
  }
  findAll() {
    return this.userModel.find().populate({
      path: 'roleID',
      populate: {
        path: 'permissions',
      },
    });
  }
  findOneByEmail(username: string) {
    return this.userModel.findOne({ email: username });
  }
  // compare password dung trong ham validateUser cua AuthService de so sanh password nhap vao va password trong database co trung khop hay khong
  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    console.log(updateUserDto);
    const userExist = await this.userModel.findOne({ _id: id });
    if (!userExist) {
      throw new UnauthorizedException(`User with id ${id} not found`);
    }
    if (updateUserDto.email && updateUserDto.email !== userExist.email) {
      const isExitEmail = await this.userModel.findOne({
        email: updateUserDto.email,
      });
      if (isExitEmail) {
        throw new UnauthorizedException(
          `Email: ${updateUserDto.email} đã tồn tại trên hệ thống xin vui lòng chọn email khác`,
        );
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = this.hashPassword(updateUserDto.password);
    }

    return await this.userModel.updateOne({ _id: id }, { ...updateUserDto });
  }

  findUser = async (refresh_Token: string) => {
    return await this.userModel.findOne({
      refreshToken: refresh_Token,
    });
  };

  async remove(id: string) {
    if (!id) {
      throw new UnauthorizedException(`User with id ${id} not found`);
    }
    const userExist = await this.userModel.findOne({ _id: id });
    if (!userExist) {
      throw new UnauthorizedException(`User with id ${id} not found`);
    }

    return await this.userModel.softDelete({ _id: id });
  }
}
