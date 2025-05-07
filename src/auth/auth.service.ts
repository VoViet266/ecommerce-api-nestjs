import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/user/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/user/interface/user.interface';
import {RegisterUserDto } from 'src/user/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
import { MailService } from 'src/mail/mail.service';
import { randomBytes, randomUUID } from 'crypto';

import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { UserDocument, User } from 'src/user/schemas/user.schemas';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private userService: UsersService,
    private configService: ConfigService,
    private MailService: MailService,
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(username);

    if (user) {
      const isValid = this.usersService.isValidPassword(pass, user.password);
      if (isValid === true) {
        return user;
      }
    }
    return null;
  }
  async login(user: IUser, res: Response) {
    const { _id, name, email, avatar } = user;

    const user_role = await (
      await this.userService.findOne(user._id)
    ).populate({
      path: 'roleID',
      populate: {
        path: 'permissions',
      },
    });
    const roleName = user_role.roleID.map((role: any) => role.name);
    const permission = user_role.roleID.flatMap((role: any) =>
      role.permissions.map((per: any) => per.name),
    );
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      avatar,
      role: {
        roleName,
        permission: permission,
      },
    };

    const refresh_Token = this.createRefreshToken({
      payload,
    });

    await this.userService.updateUserToken(refresh_Token, _id);
    console.log(process.env.NODE_ENV);
    res.cookie('refresh_Token', refresh_Token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // bật secure nếu là môi trường production
      sameSite:
      this.configService.get<string>('NODE_ENV') === 'production'
        ? 'none'
        : 'strict', // bật sameSite nếu là môi trường production
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
    });
    return {
      access_token: this.jwtService.sign(payload),
      _id,
      name,
      email,
      avatar,
      role: {
        roleName,
        permission: permission,
      },
    };
  }

  async register(user: RegisterUserDto) {
    const User = await this.userService.register(user);
    return {
      _id: User?._id,
      createdAt: User?.createdAt,
    };
  }

  createRefreshToken = (payload: object) => {
    const refresh_Token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000,
    });
    return refresh_Token;
  };

  refreshToken = async (refreshToken: string, res: Response) => {
    try {
      // Xác thực refresh token
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      // Tìm user theo refresh token
      const user = await this.userService.findUserByRefreshToken(refreshToken);
      if (!user) {
        return null;
      }

      // Lấy thông tin role và permission của user
      const userWithRole = await (
        await this.userService.findOne(user._id.toString())
      ).populate({
        path: 'roleID',
        populate: {
          path: 'permissions',
        },
      });

      const roleName = userWithRole.roleID.map((role: any) => role.name);
      const permission = userWithRole.roleID.flatMap((role: any) =>
        role.permissions.map((per: any) => per.name),
      );

      // Tạo payload cho token
      const payload = {
        sub: 'token login',
        iss: 'from server',
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: {
          roleName,
          permission,
        },
      };

      // Tạo refresh token mới
      const newRefreshToken = this.createRefreshToken({ payload });

      // Lưu refresh token mới vào DB
      await this.userService.updateUserToken(
        newRefreshToken,
        user._id.toString(),
      );

      // Xóa và gán lại cookie refresh token
      res.clearCookie('refresh_Token');

      res.cookie('refresh_Token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // bật secure nếu là môi trường production
        sameSite:
          this.configService.get<string>('NODE_ENV') === 'production'
            ? 'none'
            : 'strict',
        maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
      });

      // Trả về access token mới và thông tin user
      return {
        access_token: this.jwtService.sign(payload),
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: {
          roleName,
          permission,
        },
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Refresh Token đã hết hạn. Đăng nhập lại.',
        );
      }
      throw new BadRequestException('Refresh Token không hợp lệ.');
    }
  };
  async logout(res: Response, user: IUser) {
    await this.userService.updateUserToken('', user._id);
    res.clearCookie('refresh_Token');
    return {
      message: 'Đăng xuất thành công',
    };
  }

  //forgot password
  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('Email không tồn tại trong hệ thống.');
    }

    // Tạo token mới
    const token = randomBytes(3).toString('hex');
    // Thời gian hết hạn của token là 1 phút
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getMinutes() + 1);

    // Lưu token và thời gian hết hạn vào user
    // Lưu token và thời gian hết hạn vào user
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expiresAt;
    await user.save();

    // Gửi email với token
    await this.MailService.sendResetPasswordEmail(email, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn.');
    }

    // Mã hóa mật khẩu mới

    const hashedPassword = this.userService.hashPassword(newPassword);

    // Cập nhật mật khẩu mới và xóa thông tin reset password
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  }
}
