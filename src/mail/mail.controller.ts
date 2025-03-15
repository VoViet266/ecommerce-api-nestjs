import { Controller, Get, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public } from 'src/decorator/customize';

@Controller('api/v1/mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('/send')
  @Public()
  sendEmail(@Body() to: string) {
    console.log(to);
    return this.mailService.sendEmail(to);
  }
}
