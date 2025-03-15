import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Hoặc SMTP của nhà cung cấp khác
      auth: {
        user: this.configService.get<string>('MAIL_USER'), // Thay bằng email của bạn
        pass: this.configService.get<string>('MAIL_PASSWORD'), // Thay bằng mật khẩu email của bạn
      },
    });
  }

  async sendEmail(to: string): Promise<void> {
    console.log(to);
    const mailOptions = {
      from: `"${this.configService.get<string>(
        'MAIL_FROM_NAME',
      )}" <${this.configService.get<string>('MAIL_FROM')}>`,
      to: `vovieta3@gmail.com`,
      subject: 'Đặt lại mật khẩu',
      html: `
        <h1>Yêu cầu đặt lại mật khẩu</h1>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
        <p>Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu:</p>
        <a href="" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Đặt lại mật khẩu</a>
        <p>Liên kết này sẽ hết hạn sau 15 phút.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    const resetUrl = 'http://localhost:8080/reset-password?token=${token}';

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Yêu cầu đặt lại mật khẩu',
      html: `
        <h1>Yêu cầu đặt lại mật khẩu</h1>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu.</p>
        <p>Vui lòng nhấp vào liên kết sau để đặt lại mật khẩu của bạn:</p>
        <a href="${resetUrl}">Đặt lại mật khẩu</a>
        <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
      `,
    });
  }
}
