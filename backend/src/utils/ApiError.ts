import HttpStatus from 'http-status';

export class ApiError extends Error {
  public status: number;
  public isOperational: boolean;

  constructor(status: number, message: string, isOperational = true) {
    super(message);
    this.status = status;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg: string) {
    return new ApiError(HttpStatus.BAD_REQUEST, msg);
  }

  static notFound(msg: string) {
    return new ApiError(HttpStatus.NOT_FOUND, msg);
  }

  static internal(msg: string) {
    return new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, msg);
  }
}