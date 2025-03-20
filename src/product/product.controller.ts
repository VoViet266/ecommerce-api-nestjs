import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  Permissions,
  Public,
  ResponseMessage,
  Roles,
  User,
} from 'src/decorator/customize';
import { IUser } from 'src/user/interface/user.interface';
import { RolesUser } from 'src/constant/roles.enum';
import { PermissionsEnum } from 'src/constant/permission.enum';

@Controller('api/v1/product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Permissions(PermissionsEnum.CREATE_PRODUCT)
  @ResponseMessage('Tạo sản phẩm thành công')
  create(@Body() createProductDto: CreateProductDto, @User() user: IUser) {
    return this.productService.create(createProductDto, user);
  }
  @Get()
  @Public()
  @ResponseMessage('Lấy danh sách sản phẩm thành công')
  findAll(
    @Query('page') currentPage: string,
    @Query('limit') limit: string,
    @Query() qs: string,
    @User() user: IUser,
  ) {
    return this.productService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @ResponseMessage('Tìm kiếm sản phẩm thành công')
  @Get('/search')
  async autocomplete(@Query('q') query: string) {
    return this.productService.autocompleteSearch(query);
  }

  @Public()
  @Get(':id')
  @ResponseMessage('lấy thông tin sản phẩm thông qua Id thành công')
  async findOne(@Param('id') id: string) {
    return await this.productService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Câp nhật sản phẩm thành công')
  @Permissions(PermissionsEnum.UPDATE_PRODUCT)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @User() user: IUser,
  ) {
    return this.productService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Đã xóa sản phẩm thành công')
  @Permissions(PermissionsEnum.DELETE_PRODUCT)
  remove(@Param('id') id: string) {
    this.productService.remove(id);
    return { message: 'Xóa sản phẩm thành công' };
  }
}
