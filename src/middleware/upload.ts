import multer from 'multer';
import { ResponseHelper } from '../utils/response';

// Configurar multer para almacenar en memoria (para luego guardar en MongoDB)
const storage = multer.memoryStorage();

// Filtro para validar tipos de archivo
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Permitir solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'));
  }
};

// Configurar multer
export const uploadImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  }
});

// Middleware para manejar errores de multer
export const handleUploadError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return ResponseHelper.validationError(res, 'El archivo es demasiado grande. Máximo 5MB');
    }
  }
  
  if (err.message === 'Solo se permiten archivos de imagen') {
    return ResponseHelper.validationError(res, err.message);
  }
  
  next(err);
}; 