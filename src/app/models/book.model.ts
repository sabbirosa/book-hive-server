import { Schema, model } from "mongoose";

export interface IBook {
  title: string;
  author: string;
  genre: string;
  isbn: string;
  description: string;
  copies: number;
  available: boolean;
}

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    description: { type: String, required: false },
    copies: { type: Number, required: true },
    available: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Book = model<IBook>("Book", bookSchema);
