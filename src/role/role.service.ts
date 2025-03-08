import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Role, RoleDocument } from './Schemas/role.schemas';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { IUser } from 'src/user/interface/user.interface';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}
  async create(createRoleDto: CreateRoleDto, user: IUser) {
    let role = await this.roleModel.create({
      ...createRoleDto,
    });

    return role;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} role`;
  // }

  findAll() {
    return this.roleModel.find().populate({
      path: 'permissions',
    });
  }

  update(id: string, updateRoleDto: UpdateRoleDto) {
    return this.roleModel.updateOne(
      { _id: id },
      {
        $addToSet: {
          permissions: {
            $each: updateRoleDto.permissions,
          },
        },
      },
    );
  }
  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found role');
    }
    return (await this.roleModel.findById(id)).populate({
      path: 'permissions',
      select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 },
    });
  }

  remove(id: string) {
    return this.roleModel.deleteOne({ _id: id });
  }
}
