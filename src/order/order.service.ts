import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/user/interface/user.interface';
import { Product, ProductDocument } from 'src/product/schemas/product.schemas';
import { Cart, CartDocument } from 'src/cart/schemas/cart.schema';
import path from 'path';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly OrderModel: SoftDeleteModel<OrderDocument>,
    @InjectModel(Product.name)
    private readonly ProductModel: SoftDeleteModel<ProductDocument>,
    @InjectModel(Cart.name)
    private readonly CartModel: SoftDeleteModel<CartDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: IUser) {
    //Tìm sản phẩm trong giỏ hàng của user
    const userCart = await this.CartModel.findOne({ userId: user._id });
    if (!userCart || userCart.products.length === 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Giỏ hàng của bạn đang trống!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    //Kiểm tra sản phẩm trong giỏ hàng có tồn tại trong db không
    const cartProductIds = userCart.products.map((product) =>
      product.productId.toString(),
    );

    createOrderDto.products = userCart.products.map((product) => ({
      productId: product.productId.toString(),
      quantity: product.quantity,
      variant: product.variant,
      price: product.price,
    }));

    let totalPrice = 0;
    for (const product of createOrderDto.products) {
      if (!cartProductIds.includes(product.productId)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Sản phẩm ${product.productId} không có trong giỏ hàng!`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const productDoc = await this.ProductModel.findById(product.productId);

      if (!productDoc) {
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Không tìm thấy sản phẩm`,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (productDoc.stock < product.quantity) {
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Không đủ hàng cho sản phẩm ${productDoc.name}`,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const variant = productDoc.variant.find(
        (v) => v._id.toString() === product.variant._id.toString(),
      );
      if (!variant) {
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Không tìm thấy biến thể cho sản phẩm ${productDoc.name}`,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (variant.stock < product.quantity) {
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Không đủ hàng cho biến thể ${variant.color} ${variant.storage}`,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      totalPrice += variant.price * product.quantity;
      const updatedVariants = productDoc.variant.map((v) => {
        if (v._id.toString() === product.variant._id.toString()) {
          v.stock = Math.max(v.stock - product.quantity, 0); // Cập nhật stock
        }
        return v;
      });
      await this.ProductModel.findByIdAndUpdate(product.productId, {
        stock: Math.max(productDoc.stock - product.quantity, 0),
        variant: updatedVariants,
      });
    }

    createOrderDto.totalPrice = totalPrice;
    const newOrder = await this.OrderModel.create({
      ...createOrderDto,
      userId: user._id,
      createdBy: {
        id: user._id,
        email: user.email,
      },
    });
    //Xóa giỏ hàng sau khi tạo đơn hàng
    await this.CartModel.findOneAndDelete({ userId: user._id });
    return newOrder;
  }

  findAll() {
    return this.OrderModel.find()
      .populate([
        {
          path: 'userId',
          select: 'name email',
        },
        {
          path: 'products.productId',
          select: 'name price variant',
        },
      ])
      .exec();
  }

  findOne(id: string) {
    return this.OrderModel.findById(id)
      .populate([
        {
          path: 'userId',
          select: 'name email',
        },
        {
          path: 'products.productId',
          select: 'name price',
        },
      ])
      .exec();
  }

  //tìm đơn hàng theo  userId
  async findOrdersByUserId(userId: string) {
    const orders = await this.OrderModel.find({
      userId,
    })
      .populate([
        {
          path: 'userId',
          select: 'name email',
        },
        {
          path: 'products.productId',
          select: 'name variant images',
        },
      ])
      .exec();

    if (!orders || orders.length === 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Không tìm thấy đơn hàng',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return orders;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, user: IUser) {
    if (updateOrderDto.products) {
      let totalPrice = 0;
      for (const product of updateOrderDto.products) {
        const productDoc = await this.ProductModel.findById(product.productId);
        const order = await this.OrderModel.findById(id);

        // Khôi phục số lượng cũ trước khi cập nhật
        await this.ProductModel.updateOne(
          { _id: product.productId },
          {
            stock: (productDoc.stock += order.products.find(
              (p) => p.productId.toString() === product.productId.toString(),
            ).quantity),
          },
        );

        // Kiểm tra tồn kho
        if (productDoc.stock < product.quantity) {
          throw new HttpException(
            {
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: `Không đủ hàng cho sản phẩm ${productDoc.name}`,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        // Cập nhật số lượng tồn kho mới
        await this.ProductModel.updateOne(
          { _id: product.productId },
          { stock: (productDoc.stock -= product.quantity) },
        );

        // Tính tổng giá trị đơn hàng
        totalPrice += product.variant.price * product.quantity;
      }

      updateOrderDto.totalPrice = totalPrice;
    }

    // Cập nhật đơn hàng với dữ liệu mới
    return this.OrderModel.updateOne(
      { _id: id },
      {
        ...updateOrderDto,
        updatedBy: {
          id: user._id,
          email: user.email,
        },
      },
    );
  }

  remove(id: string) {
    return this.OrderModel.deleteOne({
      _id: id,
    });
  }
}
