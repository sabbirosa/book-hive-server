import express from "express";
import { BookRoutes } from "./book.routes";
import { BorrowRoutes } from "./borrow.routes";

export const AppRouter = express.Router();

AppRouter.use("/books", BookRoutes);
AppRouter.use("/borrows", BorrowRoutes);
