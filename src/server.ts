import dotenv from "dotenv";
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";

dotenv.config();

let server: Server;
const port = process.env.PORT || 8000;
const uri = process.env.MONGODB_URI;

const bootstrap = async () => {
  try {
    await mongoose.connect(uri as string);
    console.log("Connected to MongoDB Using Mongoose!!");
    server = app.listen(port, () => {
      console.log(`BookHive Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
};

// For Vercel serverless functions
if (process.env.VERCEL) {
  // Export the app for Vercel
  module.exports = app;
} else {
  // Run normally for local development
  bootstrap();
}

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection at:", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Default export for Vercel
export default app;
