import cors from "cors";
import express, { Application, Request, Response } from "express";
import errorMiddleware from "./app/middlewares/error.middleware";
import { router } from "./app/routes";

const app: Application = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.urlencoded({ extended: true }));

// Route entry point
app.use("/api", router);

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.send("BookHive API is running!");
});
app.use(errorMiddleware);

export default app;
