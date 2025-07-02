import express from "express";
import { BookRoutes } from "./book.routes";
import { BorrowRoutes } from "./borrow.routes";

export const router = express.Router();

router.use("/books", BookRoutes);
router.use("/borrows", BorrowRoutes);
