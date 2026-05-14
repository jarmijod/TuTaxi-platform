import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MulterModule.register({ dest: './uploads' }),
    UsersModule,
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
