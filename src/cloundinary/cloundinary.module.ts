import { Module } from '@nestjs/common';
import { CloundinaryService } from './cloundinary.service';
import { CloundinaryController } from './cloundinary.controller';
import { CloudinaryProvider } from './cloudinary.provider';

@Module({
  controllers: [CloundinaryController],
  providers: [CloudinaryProvider, CloundinaryService],
  exports: [CloudinaryProvider, CloundinaryService],
})
export class CloundinaryModule {}
