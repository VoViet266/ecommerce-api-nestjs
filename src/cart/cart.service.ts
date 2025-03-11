import { Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart, CartDocument } from './schemas/cart.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/user/interface/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from 'src/product/schemas/product.schemas';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: SoftDeleteModel<CartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: SoftDeleteModel<ProductDocument>,
  ) {}

  async create(createCartDto: CreateCartDto, user: IUser) {
    const products = await Promise.all(
      createCartDto.products.map(async (product) => {
        const productData = await this.productModel.findById(product.productId);
        //tìm variant của sản phẩm
        const variant = productData.variant.find(
          (v) => v._id.toString() === product.variant._id.toString(),
        );
        if (!productData) {
          throw new Error(`Product with ID ${product.productId} not found`);
        }
        if (!variant) {
          throw new Error(`Variant with ID ${product.variant._id} not found`);
        }

        // Tính tổng tiền của sản phẩm
        const total = product.quantity * variant.price;

        return {
          productId: product.productId,
          name: productData.name,
          variant: variant,
          quantity: product.quantity,
          price: variant.price,
          total,
        };
      }),
    );

    return this.cartModel.create({
      ...createCartDto,
      userId: user._id,
      products,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
  }
  findAll() {
    return this.cartModel.find();
  }

  findOne(id: string) {
    return this.cartModel.findById(id).populate('products.productId').exec();
  }

  update(id: string, updateCartDto: UpdateCartDto) {
    return this.cartModel.updateOne(
      {
        _id: id,
      },
      updateCartDto,
    );
  }

  remove(id: string) {
    return this.cartModel.deleteOne({
      _id: id,
    });
  }
}
