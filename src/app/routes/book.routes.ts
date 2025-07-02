import express from "express";
import {
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  updateBook,
} from "../controller/book.controller";

const router = express.Router();

router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.post("/", createBook);
router.patch("/:id", updateBook);
router.delete("/:id", deleteBook);

export const BookRoutes = router;
