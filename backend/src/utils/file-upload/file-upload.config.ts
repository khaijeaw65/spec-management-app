import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

// file-upload.config.ts
export const momFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const allowedMimeTypes = [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new BadRequestException('File must be .txt, .pdf, or .docx'),
      false,
    );
  }
};

export const momFileOptions: MulterOptions = {
  fileFilter: momFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
};
