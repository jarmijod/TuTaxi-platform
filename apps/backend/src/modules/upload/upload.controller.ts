import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { UploadService } from './upload.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

const storage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    const name = uuid() + extname(file.originalname);
    cb(null, name);
  },
});

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly usersService: UsersService,
  ) {}

  @Post('avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    this.uploadService.validateFile(file);
    const path = this.uploadService.getFilePath(file);
    await this.usersService.updateAvatar(userId, path);
    return { avatar: path };
  }

  @Post('document')
  @ApiOperation({ summary: 'Upload driver document' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    this.uploadService.validateFile(file);
    const path = this.uploadService.getFilePath(file);
    return { document: path };
  }
}
