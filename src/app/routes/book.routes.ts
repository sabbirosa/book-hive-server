import express from "express";
import {
  createBook,
  deleteBook,
  getAllBooks,
  getAvailableBooks,
  getBookById,
  getBooksByGenre,
  updateBook,
  updateBookAvailability,
} from "../controller/book.controller";
import {
  createBookValidation,
  updateBookValidation,
} from "../middlewares/validate.middleware";

const router = express.Router();

// Get all books with pagination and filters
router.get("/", getAllBooks);

// Get available books only
router.get("/available", getAvailableBooks);

// Get books by genre
router.get("/genre/:genre", getBooksByGenre);

// Get single book
router.get("/:id", getBookById);

// Create new book
router.post("/", createBookValidation, createBook);

// Update book
router.put("/:id", updateBookValidation, updateBook);

// Update book availability
router.put("/:id/availability", updateBookAvailability);

// Delete book
router.delete("/:id", deleteBook);

export const BookRoutes = router;
