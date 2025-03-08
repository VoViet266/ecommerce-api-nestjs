import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/user/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/user/interface/user.interface';
import { CreateUserDto, RegisterUserDto } from 'src/user/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private userService: UsersService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await (
      await this.usersService.findOneByEmail(username)
    ).populate({
      path: 'roleID',
      populate: { path: 'permissions' }, // Populate permissions trong role
    });
    if (user) {
      const isValid = this.usersService.isValidPassword(pass, user.password);
      if (isValid === true) {
        return user;
      }
    }
    return null;
  }
  async login(user: IUser, res: Response) {
    const { _id, name, email } = user;

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
      role: {
        roleName,
        permission: permission,
      },
    };

    const refresh_Token = this.createRefreshToken({
      payload,
    });

    await this.userService.updateUserToken(refresh_Token, _id);

    res.cookie('refresh_Token', refresh_Token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
    });
    return {
      access_token: this.jwtService.sign(payload),
      _id,
      name,
      email,
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

  refreshToken = async (refresh_Token: string, res: Response) => {
    try {
      this.jwtService.verify(refresh_Token, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
      let user = await this.userService.findUser(refresh_Token);
      if (user) {
        const { _id, name, email } = user;

        const user_role = await this.userService.findOne(user._id.toString());

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
          role: {
            roleName,
            permission: permission,
          },
        };

        const refresh_Token = this.createRefreshToken({
          payload,
        });

        await this.userService.updateUserToken(refresh_Token, _id.toString());

        res.clearCookie('refresh_Token');

        res.cookie('refresh_Token', refresh_Token, {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
        });
        return {
          access_token: this.jwtService.sign(payload),
          _id,
          name,
          email,
          roles: {
            roleName,
            permission: permission,
          },
        };
      } else {
        throw new BadRequestException(
          'Refresh Token không hợp lệ, vui lòng đăng nhập lại!!!!',
        );
      }
    } catch (error) {
      throw new BadRequestException(
        'Refresh Token không hợp lệ, vui lòng đăng nhập lại ',
      );
    }
  };
  async logout(res: Response, user: IUser) {
    await this.userService.updateUserToken('', user._id);
    res.clearCookie('refresh_Token');
    return {
      message: 'Đăng xuất thành công',
    };
  }
}
