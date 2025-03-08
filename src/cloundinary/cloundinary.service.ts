import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
@Injectable()
export class CloundinaryService {
  async uploadImage(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'uploads',
          resource_type: 'auto',
          access_mode: 'public',
          allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
          access_control: [],
        },
        (error, result) => {
          if (error) {
            console.error('Lỗi khi upload:', error);
            return reject(error);
          }
          return resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });
  }

  async getImage(publicId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.api.resource(publicId, (error, result) => {
        if (error) {
          console.error('Lỗi khi lấy ảnh:', error);
          return reject(error);
        }
        return resolve(result.secure_url);
      });
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error('Lỗi khi xóa ảnh:', error);
          return reject(error);
        }
        return resolve();
      });
    });
  }
}
