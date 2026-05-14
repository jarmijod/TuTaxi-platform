import { Injectable, BadRequestException } from '@nestjs/common';
import { extname } from 'path';

@Injectable()
export class UploadService {
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  private readonly maxSize = 5 * 1024 * 1024; // 5MB

  validateFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');

    const ext = extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.includes(ext)) {
      throw new BadRequestException('Invalid file type. Allowed: jpg, jpeg, png, webp');
    }

    if (file.size > this.maxSize) {
      throw new BadRequestException('File too large. Max: 5MB');
    }

    return true;
  }

  getFilePath(file: Express.Multer.File): string {
    // Returns relative path - ready for S3 migration
    return `/uploads/${file.filename}`;
  }
}
