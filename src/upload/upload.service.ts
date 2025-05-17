import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Injectable()
export class UploadService {
  getMulterConfig() {
    return {
      storage: diskStorage({
        destination: './uploads', // Save files in 'uploads' folder
        filename: (req, file, cb) => {
          // Generate a unique filename
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const fileExt = extname(file.originalname); // Get file extension
          cb(null, `${uniqueSuffix}${fileExt}`);
        },
      }),
    };
  }
}
