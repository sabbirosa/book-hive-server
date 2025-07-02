import express from "express";
import {
    borrowBook,
    getAllBorrows,
    getBorrowStatistics,
    getBorrowSummary,
    getOverdueBooks,
    getTotalBorrowedForBook,
} from "../controller/borrow.controller";
import { createBorrowValidation } from "../middlewares/validate.middleware";

const router = express.Router();

// Get all borrows with pagination
router.get("/", getAllBorrows);

// Borrow a book
router.post("/", createBorrowValidation, borrowBook);

// Get borrow summary (aggregation)
router.get("/summary", getBorrowSummary);

// Get overdue books
router.get("/overdue", getOverdueBooks);

// Get borrow statistics
router.get("/statistics", getBorrowStatistics);

// Get total borrowed for a specific book
router.get("/book/:bookId", getTotalBorrowedForBook);

export const BorrowRoutes = router;
