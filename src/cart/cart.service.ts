import { Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart, CartDocument } from './schemas/cart.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/user/interface/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from 'src/product/schemas/product.schemas';
import { Types } from 'mongoose';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: SoftDeleteModel<CartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: SoftDeleteModel<ProductDocument>,
  ) {}

  async create(createCartDto: CreateCartDto, user: IUser) {
    // First, try to find an existing cart for the user
    let cart = await this.cartModel.findOne({ userId: user._id });

    // If no cart exists, create a new one
    if (!cart) {
      cart = new this.cartModel({
        userId: user._id,
        products: [],
        totalPrice: 0,
      });
    }

    // Process each product in the createCartDto
    for (const product of createCartDto.products) {
      const productData = await this.productModel.findById(product.productId);
      if (!productData) {
        throw new Error(`Product with ID ${product.productId} not found`);
      }

      // Find the variant
      const variant = productData.variant.find(
        (v) => v._id.toString() === product.variant._id.toString(),
      );
      if (!variant) {
        throw new Error(`Variant with ID ${product.variant._id} not found`);
      }

      // Check if this product with the same variant already exists in the cart
      const existingProductIndex = cart.products.findIndex(
        (item) =>
          item.productId.toString() === product.productId.toString() &&
          item.variant._id.toString() === product.variant._id.toString(),
      );

      if (existingProductIndex !== -1) {
        // Product exists, increase quantity by the amount from DTO (or by 1 if you prefer)
        cart.products[existingProductIndex].quantity += product.quantity;
        // Update the total price for this item
        cart.totalPrice =
          cart.products[existingProductIndex].quantity * variant.price;
      } else {
        // Product doesn't exist in cart, add it
        cart.products.push({
          productId: new Types.ObjectId(product.productId),
          name: productData.name,
          variant: variant,
          quantity: product.quantity,
          price: variant.price,
        });
      }
    }

    // Recalculate the total price of the cart
    cart.totalPrice = cart.products.reduce(
      (sum, product) => sum + product.quantity * product.price,
      0,
    );

    // Save the cart
    await cart.save();

    return cart;
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
