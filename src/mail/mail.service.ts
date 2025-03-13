// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import * as nodemailer from 'nodemailer';

// @Injectable()
// export class MailService {
//   private transporter;

//   constructor(private configService: ConfigService) {
//     // Cấu hình transporter
//     this.transporter = nodemailer.createTransport({
//       host: this.configService.get<string>('MAIL_HOST'),
//       port: this.configService.get<number>('MAIL_PORT'),
//       secure: this.configService.get<boolean>('MAIL_SECURE'),
//       auth: {
//         user: this.configService.get<string>('MAIL_USER'),
//         pass: this.configService.get<string>('MAIL_PASSWORD'),
//       },
//     });
//   }

//   async sendResetPasswordEmail(to: string, resetToken: string): Promise<void> {
//     const resetUrl = `${this.configService.get<string>(
//       'FRONTEND_URL',
//     )}/reset-password?token=${resetToken}`;

//     const mailOptions = {
//       from: `"${this.configService.get<string>(
//         'MAIL_FROM_NAME',
//       )}" <${this.configService.get<string>('MAIL_FROM')}>`,
//       to,
//       subject: 'Đặt lại mật khẩu',
//       html: `
//         <h1>Yêu cầu đặt lại mật khẩu</h1>
//         <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
//         <p>Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu:</p>
//         <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Đặt lại mật khẩu</a>
//         <p>Liên kết này sẽ hết hạn sau 15 phút.</p>
//         <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
//       `,
//     };

//     await this.transporter.sendMail(mailOptions);
//   }
// }
