import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details ?? null
    });
  }

  console.error(error);
  return res.status(500).json({
    message: "Internal server error"
  });
}
