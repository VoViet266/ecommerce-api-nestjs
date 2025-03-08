import {
  Controller,
  Post,
  UseGuards,
  Body,
  Res,
  Get,
  Req,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { LocalAuthGuard } from '../common/guards/local.guard';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from '../decorator/customize';
import { RegisterUserDto } from 'src/user/dto/create-user.dto';
import { IUser } from 'src/user/interface/user.interface';

@Controller('/api/v1/auth') // Namespace cho module Auth
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Public()
  @ResponseMessage('Đăng nhập thành công')
  @Post('/login')
  handleLogin(@Request() req: any, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(req.user, res);
  }

  @Public()
  @Post('/register')
  @ResponseMessage('Đăng ký thành công')
  async register(@Body() register: RegisterUserDto) {
    return this.authService.register(register);
  }

  @ResponseMessage('Lấy thông tin tài khoản thành công')
  @Get('/account')
  handleGetAccount(@User() user: IUser) {
    return {
      user,
    };
  }

  @ResponseMessage('Lấy Refresh Token thành công')
  @Get('/refresh')
  @Public()
  handleRefreshToken(
    @Req() request: Request & { cookies: { [key: string]: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = request.cookies['refresh_Token'];
    return this.authService.refreshToken(refreshToken, res);
  }

  @ResponseMessage('Đăng xuất thành công')
  @Get('/logout')
  handleLogout(@Res({ passthrough: true }) res: Response, @User() user: IUser) {
    return this.authService.logout(res, user);
  }
}
