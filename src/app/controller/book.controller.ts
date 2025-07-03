import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { Book } from "../models/book.model";
import { Borrow } from "../models/borrow.model";

// Create Book
export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: book,
    });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: err.errors,
      });
      return;
    }
    if (err.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Book with this ISBN already exists",
      });
      return;
    }
    next(err);
  }
};

// Get All Books with pagination and filters
export const getAllBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    if (req.query.genre) {
      filter.genre = req.query.genre;
    }

    if (req.query.available !== undefined) {
      filter.available = req.query.available === "true";
    }

    if (req.query.author) {
      filter.author = { $regex: req.query.author, $options: "i" };
    }

    // Improved search logic to avoid MongoDB $text + $or indexing issues
    if (req.query.search) {
      const searchTerm = req.query.search as string;

      // Try text search first for better performance on indexed fields
      // If that fails or returns no results, fall back to regex search
      try {
        const textSearchFilter = { ...filter, $text: { $search: searchTerm } };
        const textResults = await Book.find(textSearchFilter).limit(1);

        if (textResults.length > 0) {
          // Text search works and found results, use it
          filter.$text = { $search: searchTerm };
        } else {
          // No results from text search, use regex search
          filter.$or = [
            { title: { $regex: searchTerm, $options: "i" } },
            { author: { $regex: searchTerm, $options: "i" } },
            { isbn: { $regex: searchTerm, $options: "i" } },
          ];
        }
      } catch (textSearchError) {
        // Text search failed (possibly no text index), fall back to regex
        filter.$or = [
          { title: { $regex: searchTerm, $options: "i" } },
          { author: { $regex: searchTerm, $options: "i" } },
          { isbn: { $regex: searchTerm, $options: "i" } },
        ];
      }
    }

    // Build sort object
    let sort: any = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
      sort = { [sortBy]: sortOrder };
    }

    const books = await Book.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Book.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: books,
      pagination: {
        currentPage: page,
        totalPages,
        totalBooks: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get Available Books (using static method)
export const getAvailableBooks = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const books = await Book.findAvailableBooks();
    res.json({
      success: true,
      data: books,
      count: books.length,
    });
  } catch (err) {
    next(err);
  }
};

// Get Books by Genre (using static method)
export const getBooksByGenre = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { genre } = req.params;
    const books = await Book.findByGenre(genre);
    res.json({
      success: true,
      data: books,
      genre: genre,
      count: books.length,
    });
  } catch (err) {
    next(err);
  }
};

// Get Single Book
export const getBookById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid book ID format",
      });
      return;
    }

    const book = await Book.findById(id);
    if (!book) {
      res.status(404).json({
        success: false,
        message: "Book not found",
      });
      return;
    }

    res.json({
      success: true,
      data: book,
    });
  } catch (err) {
    next(err);
  }
};

// Update Book
export const updateBook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid book ID format",
      });
      return;
    }

    // Find the book first
    const book = await Book.findById(id);
    if (!book) {
      res.status(404).json({
        success: false,
        message: "Book not found",
      });
      return;
    }

    // Update the book fields
    Object.assign(book, req.body);

    // Apply business logic: if copies set to 0, mark as unavailable
    if (book.copies <= 0) {
      book.available = false;
    } else if (book.copies > 0 && req.body.available !== false) {
      // Only set to true if not explicitly set to false
      book.available = true;
    }

    // Save the book (this will trigger pre-save middleware and validation)
    const updatedBook = await book.save();

    res.json({
      success: true,
      message: "Book updated successfully",
      data: updatedBook,
    });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: err.errors,
      });
      return;
    }
    if (err.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Book with this ISBN already exists",
      });
      return;
    }
    next(err);
  }
};

// Delete Book
export const deleteBook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid book ID format",
      });
      return;
    }

    const book = await Book.findById(id);
    if (!book) {
      res.status(404).json({
        success: false,
        message: "Book not found",
      });
      return;
    }

    // Delete all borrow records associated with this book
    await Borrow.deleteMany({ book: id });

    // Delete the book
    await Book.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Book and associated borrow records deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

// Update book availability (using instance method)
export const updateBookAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid book ID format",
      });
      return;
    }

    const book = await Book.findById(id);
    if (!book) {
      res.status(404).json({
        success: false,
        message: "Book not found",
      });
      return;
    }

    await book.updateAvailability();
    res.json({
      success: true,
      message: "Book availability updated",
      data: {
        available: book.available,
        copies: book.copies,
      },
    });
  } catch (err) {
    next(err);
  }
};
