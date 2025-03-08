import { IsEnum, IsString } from 'class-validator';
import { PermissionsEnum } from 'src/constant/permissions.enum';

export class CreatePermissionDto {
  @IsEnum(PermissionsEnum, { message: 'Permission không hợp lệ' })
  name: PermissionsEnum;

  @IsString({ message: 'Mô tả không hợp lệ' })
  description: string;

  @IsString({ message: 'Module không hợp lệ' })
  module: string;

  @IsString({ message: 'Action không hợp lệ' })
  action: string;
}
