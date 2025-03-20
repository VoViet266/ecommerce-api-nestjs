import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';

@Controller('api/v1/mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // @Post('/send')
  // @Public()
  // @ResponseMessage('Gửi email thành công')
  // sendEmail(@Body() to: string) {
  //   return this.mailService.sendResetPasswordEmail(to);
  // }
}
