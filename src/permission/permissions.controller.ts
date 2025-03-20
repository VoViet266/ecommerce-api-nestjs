import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Roles, User } from 'src/decorator/customize';
import { IUser } from 'src/user/interface/user.interface';
import { RolesUser } from 'src/constant/roles.enum';
import { Role } from 'src/role/Schemas/role.schemas';

@Controller('/api/v1/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Roles(RolesUser.Admin)
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @User() user: IUser,
  ) {
    return this.permissionsService.create(createPermissionDto, user);
  }

  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get()
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(+id);
  }

  @Patch()
  @Roles(RolesUser.Admin)
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(+id, updatePermissionDto);
  }
  @Delete()
  @Roles(RolesUser.Admin)
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(+id);
  }
}
