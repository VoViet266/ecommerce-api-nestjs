import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
} from '@nestjs/common';
import { CloundinaryService } from './cloundinary.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/decorator/customize';

@Controller('upload')
export class CloundinaryController {
  constructor(private readonly cloundinaryService: CloundinaryService) {}

  @Public()
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.cloundinaryService.uploadImage(file);
  }

  @Public()
  @Get('image/:publicId')
  getAllImages(@Param('publicId') publicId: string) {
    return this.cloundinaryService.getImage(publicId);
  }
}
