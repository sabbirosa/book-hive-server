import { NextFunction, Request, Response } from "express";
import { Book } from "../models/book.model";
import { Borrow } from "../models/borrow.model";

// Borrow a Book
export const borrowBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { book: bookId, quantity, dueDate } = req.body;

    const book = await Book.findById(bookId);
    if (!book)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });

    if (!book.available || book.copies < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough copies available" });
    }

    // Deduct copies
    book.copies -= quantity;
    if (book.copies === 0) {
      book.available = false;
    }

    await book.save();

    const borrowEntry = await Borrow.create({
      book: bookId,
      quantity,
      dueDate,
    });

    res.status(201).json({ success: true, data: borrowEntry });
  } catch (err) {
    next(err);
  }
};

// Get all Borrow records
export const getAllBorrows = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const borrows = await Borrow.find().populate("book", "title isbn");
    res.json({ success: true, data: borrows });
  } catch (err) {
    next(err);
  }
};

// Borrow Summary (Aggregation)
export const getBorrowSummary = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const summary = await Borrow.aggregate([
      {
        $group: {
          _id: "$book",
          totalBorrowed: { $sum: "$quantity" },
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      {
        $unwind: "$bookDetails",
      },
      {
        $project: {
          _id: 0,
          title: "$bookDetails.title",
          isbn: "$bookDetails.isbn",
          totalBorrowed: 1,
        },
      },
    ]);

    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};
