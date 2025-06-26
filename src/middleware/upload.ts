import multer from 'multer';
import { ResponseHelper } from '../utils/response';

// Configure multer to store in memory (to later save in MongoDB)
const storage = multer.memoryStorage();

// Filter to validate file types
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allow only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'));
  }
};

// Configure multer
export const uploadImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum
  },
});

// Middleware to handle multer errors
export const handleUploadError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return ResponseHelper.validationError(
        res,
        'El archivo es demasiado grande. Máximo 5MB'
      );
    }
  }

  if (err.message === 'Solo se permiten archivos de imagen') {
    return ResponseHelper.validationError(res, err.message);
  }

  next(err);
};
