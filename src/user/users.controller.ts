import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import mongoose, { mongo } from 'mongoose';
import { Public, ResponseMessage, Roles, User } from 'src/decorator/customize';
import { IUser } from './interface/user.interface';
import { RolesUser } from 'src/constant/roles.enum';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(RolesUser.Admin)
  create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    return this.usersService.create(createUserDto, user);
  }

  @Get()
  @Roles(RolesUser.Admin)
  @Public()
  @ResponseMessage('Lấy danh sách người dùng thành công')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(RolesUser.Customer, RolesUser.Admin)
  @ResponseMessage('Lấy thông tin người dùng thành công')
  findOne(@Param('id') id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return `User with id ${id} not found`;
    }
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  // @Roles(RolesUser.Customer)
  @ResponseMessage('Cập nhật thông tin người dùng thành công')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return `User with id ${id} not found`;
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  // @Roles(RolesUser.Customer)
  @ResponseMessage('Xóa người dùng thành công')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
