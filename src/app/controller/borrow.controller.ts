import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { Book } from "../models/book.model";
import { Borrow } from "../models/borrow.model";

// Borrow a Book (now handled by middleware)
export const borrowBook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { book: bookId, quantity, dueDate } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      res.status(400).json({ 
        success: false, 
        message: "Invalid book ID format" 
      });
      return;
    }

    // Validate quantity
    if (!quantity || quantity < 1) {
      res.status(400).json({
        success: false,
        message: "Quantity must be at least 1"
      });
      return;
    }

    // Validate due date
    if (!dueDate || new Date(dueDate) <= new Date()) {
      res.status(400).json({
        success: false,
        message: "Due date must be in the future"
      });
      return;
    }

    // Check if book exists and has enough copies
    const book = await Book.findById(bookId);
    if (!book) {
      res.status(404).json({
        success: false,
        message: "Book not found"
      });
      return;
    }

    if (!book.available || book.copies < quantity) {
      res.status(400).json({
        success: false,
        message: `Not enough copies available. Only ${book.copies} copies left.`
      });
      return;
    }

    // Create borrow entry (middleware will handle book update)
    const borrowEntry = await Borrow.create({
      book: bookId,
      quantity,
      dueDate: new Date(dueDate),
    });

    // Populate book details for response
    await borrowEntry.populate('book', 'title author isbn');

    res.status(201).json({ 
      success: true, 
      message: "Book borrowed successfully",
      data: borrowEntry 
    });
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: err.errors
      });
      return;
    }
    if (err.message && err.message.includes('Not enough copies')) {
      res.status(400).json({
        success: false,
        message: err.message
      });
      return;
    }
    next(err);
  }
};

// Get all Borrow records with pagination
export const getAllBorrows = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};
    
    if (req.query.book) {
      filter.book = req.query.book;
    }
    
    if (req.query.overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
    }

    // Build sort object
    let sort: any = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort = { [sortBy]: sortOrder };
    }

    const borrows = await Borrow.find(filter)
      .populate("book", "title author isbn genre")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Borrow.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({ 
      success: true, 
      data: borrows,
      pagination: {
        currentPage: page,
        totalPages,
        totalBorrows: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    next(err);
  }
};

// Borrow Summary (Enhanced Aggregation)
export const getBorrowSummary = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const summary = await Borrow.getBorrowSummary();
    res.json({ 
      success: true, 
      data: summary,
      count: summary.length
    });
  } catch (err) {
    next(err);
  }
};

// Get Overdue Books (using static method)
export const getOverdueBooks = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const overdueBooks = await Borrow.getOverdueBooks();
    res.json({ 
      success: true, 
      data: overdueBooks,
      count: overdueBooks.length
    });
  } catch (err) {
    next(err);
  }
};

// Get total borrowed for a specific book
export const getTotalBorrowedForBook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      res.status(400).json({ 
        success: false, 
        message: "Invalid book ID format" 
      });
      return;
    }

    const book = await Book.findById(bookId);
    if (!book) {
      res.status(404).json({
        success: false,
        message: "Book not found"
      });
      return;
    }

    const totalBorrowed = await Borrow.getTotalBorrowedForBook(bookId);
    
    res.json({ 
      success: true, 
      data: {
        bookId,
        title: book.title,
        totalBorrowed,
        remainingCopies: book.copies
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get borrow statistics
export const getBorrowStatistics = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await Borrow.aggregate([
      {
        $facet: {
          totalBorrows: [
            { $count: "count" }
          ],
          totalQuantityBorrowed: [
            { $group: { _id: null, total: { $sum: "$quantity" } } }
          ],
          overdueCount: [
            { $match: { dueDate: { $lt: new Date() } } },
            { $count: "count" }
          ],
          borrowsByMonth: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" }
                },
                count: { $sum: 1 },
                quantity: { $sum: "$quantity" }
              }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } },
            { $limit: 12 }
          ],
          mostBorrowedBooks: [
            {
              $group: {
                _id: "$book",
                totalBorrowed: { $sum: "$quantity" },
                borrowCount: { $sum: 1 }
              }
            },
            {
              $lookup: {
                from: "books",
                localField: "_id",
                foreignField: "_id",
                as: "bookDetails"
              }
            },
            { $unwind: "$bookDetails" },
            {
              $project: {
                title: "$bookDetails.title",
                author: "$bookDetails.author",
                totalBorrowed: 1,
                borrowCount: 1
              }
            },
            { $sort: { totalBorrowed: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]);

    const statistics = {
      totalBorrows: stats[0].totalBorrows[0]?.count || 0,
      totalQuantityBorrowed: stats[0].totalQuantityBorrowed[0]?.total || 0,
      overdueCount: stats[0].overdueCount[0]?.count || 0,
      borrowsByMonth: stats[0].borrowsByMonth,
      mostBorrowedBooks: stats[0].mostBorrowedBooks
    };

    res.json({ 
      success: true, 
      data: statistics
    });
  } catch (err) {
    next(err);
  }
};
