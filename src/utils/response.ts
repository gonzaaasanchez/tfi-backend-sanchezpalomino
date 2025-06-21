import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export class ResponseHelper {
  static success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      ...(data !== undefined && { data }),
    };

    res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 400,
    data: any = null
  ): void {
    const response: ApiResponse = {
      success: false,
      message,
      data,
    };

    res.status(statusCode).json(response);
  }

  static notFound(
    res: Response,
    message: string = 'Recurso no encontrado'
  ): void {
    this.error(res, message, 404);
  }

  static unauthorized(res: Response, message: string = 'No autorizado'): void {
    this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = 'Acceso denegado'): void {
    this.error(res, message, 403);
  }

  static validationError(res: Response, message: string): void {
    this.error(res, message, 400);
  }

  static serverError(
    res: Response,
    message: string = 'Error interno del servidor'
  ): void {
    this.error(res, message, 500);
  }
}
