import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { FileService } from './file.service';

import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Controller('api/v1')
export class FileController {
  private readonly Base_URL: string;
  private readonly PORT: string;

  constructor(
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
  ) {
    this.Base_URL = this.configService.get<string>('BASE_URL');
    this.PORT = this.configService.get<string>('PORT');
  }

  @Post('upload')
  @ResponseMessage('Upload file thành công')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(png|jpe?g|gif|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 2000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Req() request: Request,
  ) {
    const filePath = `${this.Base_URL}${this.PORT}/uploads/${file.filename}`;
    console.log(filePath);
    return {
      filePath: filePath,
      filename: file.filename,
    };
  }

  @Delete('delete/:filename')
  @Public()
  @ResponseMessage('Xóa file thành công')
  async deleteFile(@Param('filename') filename: string) {
    try {
      // Xác định đường dẫn file
      const filePath = path.join(process.cwd(), 'public/uploads', filename);

      // Kiểm tra xem file có tồn tại không
      if (!fs.existsSync(filePath)) {
        
      }

      // Xóa file
      fs.unlinkSync(filePath);
      console.log(`File ${filename} đã được xóa thành công`);
      return {
        filename,
        message: `File ${filename} đã được xóa thành công`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Không thể xóa file: ${error.message}`);
    }
  }
}
