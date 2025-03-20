import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  Permissions,
  Public,
  ResponseMessage,
  User,
} from 'src/decorator/customize';
import { IUser } from 'src/user/interface/user.interface';
import { PermissionsEnum } from 'src/constant/permission.enum';

@Controller('api/v1/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @User() user: IUser) {
    return this.categoryService.create(createCategoryDto, user);
  }

  @Get()
  @ResponseMessage('Lây danh sách danh mục thành công')
  @Public()
  findAll(
    @Query('page') currentPage: string,
    @Query('limit') limit: string,
    @Query() qs: string,
  ) {
    return this.categoryService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Lấy thông tin danh mục thành công')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @Permissions(PermissionsEnum.UPDATE_CATEGORY)
  @ResponseMessage('Cập nhật danh mục thành công')
  @Permissions(PermissionsEnum.UPDATE_CATEGORY)
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @User() user: IUser,
  ) {
    return this.categoryService.update(id, updateCategoryDto, user);
  }

  @Delete(':id')
  @Permissions(PermissionsEnum.DELETE_CATEGORY)
  @ResponseMessage('Xóa danh mục thành công')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
