import { NextFunction, Request, Response } from "express";
import { Book } from "../models/book.model";

// Create Book
export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// Get All Books
export const getAllBooks = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const books = await Book.find();
    res.json({ success: true, data: books });
  } catch (err) {
    next(err);
  }
};

// Get Single Book
export const getBookById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// Update Book
export const updateBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// Delete Book
export const deleteBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    res.json({ success: true, message: "Book deleted" });
  } catch (err) {
    next(err);
  }
};
