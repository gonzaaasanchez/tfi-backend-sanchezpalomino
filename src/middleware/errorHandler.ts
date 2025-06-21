import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ResponseHelper } from '../utils/response';

// Interfaz para errores personalizados
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Clase para errores personalizados
export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware de manejo de errores
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error para debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    user: req.user?.email || 'No autenticado',
  });

  // Error de Mongoose - ID inválido
  if (err.name === 'CastError') {
    const message = 'Recurso no encontrado';
    error = new CustomError(message, 404);
  }

  // Error de Mongoose - Validación
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(', ');
    error = new CustomError(message, 400);
  }

  // Error de Mongoose - Duplicado
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    const message = `${field} ya existe`;
    error = new CustomError(message, 400);
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = new CustomError(message, 401);
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = new CustomError(message, 401);
  }

  // Respuesta de error usando el nuevo formato
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Error interno del servidor';

  ResponseHelper.error(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};

// Middleware para capturar errores asíncronos con tipos correctos
export const asyncHandler = <T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<void> | void
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as T, res, next)).catch(next);
  };
};
