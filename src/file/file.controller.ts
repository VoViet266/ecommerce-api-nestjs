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
} from '@nestjs/common';
import { FileService } from './file.service';

import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseMessage } from 'src/decorator/customize';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

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
    const folderType = request.headers['folder_type'];

    const filePath = folderType
      ? `${this.Base_URL}${this.PORT}/images/${folderType}/${file.filename}`
      : `${this.Base_URL}${this.PORT}/images/${file.filename}`;
    console.log(filePath);
    return {
      filePath: filePath,
    };
  }

  @Get()
  findAll() {
    return this.fileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.fileService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileService.remove(+id);
  }
}
