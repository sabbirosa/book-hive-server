import express from "express";
import {
  borrowBook,
  getAllBorrows,
  getBorrowSummary,
} from "../controller/borrow.controller";

const router = express.Router();

router.get("/", getAllBorrows);
router.post("/", borrowBook);
router.get("/summary", getBorrowSummary);

export const BorrowRoutes = router;
