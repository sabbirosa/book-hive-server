import { NextFunction, Request, Response } from "express";

// Simple middleware to ensure request body exists
const validateRequestBody = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({
      message: "Request body is required",
      success: false,
      error: "Empty request body",
    });
    return;
  }
  next();
};

// Middleware to validate that at least one field is provided for updates
const validateUpdateBody = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({
      message: "At least one field is required for update",
      success: false,
      error: "Empty update body",
    });
    return;
  }
  next();
};

// Book validation - just ensure body exists (Mongoose handles the rest)
export const createBookValidation = validateRequestBody;

// Update book validation - ensure at least one field to update
export const updateBookValidation = validateUpdateBody;

// Borrow validation - just ensure body exists (Mongoose handles the rest)
export const createBorrowValidation = validateRequestBody;

export default validateRequestBody;
