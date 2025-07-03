import { Document, Model, Schema, model } from "mongoose";

export interface IBook extends Document {
  title: string;
  author: string;
  genre: string;
  isbn: string;
  description?: string;
  copies: number;
  available: boolean;
  isAvailable(): boolean;
  updateAvailability(): Promise<void>;
}

export interface IBookModel extends Model<IBook> {
  findAvailableBooks(): Promise<IBook[]>;
  findByGenre(genre: string): Promise<IBook[]>;
}

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [1, "Title cannot be empty"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      minlength: [1, "Author cannot be empty"],
      maxlength: [100, "Author cannot exceed 100 characters"],
    },
    genre: {
      type: String,
      required: [true, "Genre is required"],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, "ISBN is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    copies: {
      type: Number,
      required: [true, "Number of copies is required"],
      min: [0, "Copies cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Copies must be a whole number",
      },
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
bookSchema.index({ isbn: 1 });
bookSchema.index({ genre: 1 });
bookSchema.index({ available: 1 });
bookSchema.index({ title: "text", author: "text" }); // Text search

// Pre-save middleware to set availability
bookSchema.pre("save", function (next) {
  if (this.copies <= 0) {
    this.available = false;
  } else if (this.copies > 0 && !this.available) {
    this.available = true;
  }
  next();
});

// Instance method to check availability
bookSchema.methods.isAvailable = function (): boolean {
  return this.available && this.copies > 0;
};

// Instance method to update availability based on copies
bookSchema.methods.updateAvailability = async function (): Promise<void> {
  this.available = this.copies > 0;
  await this.save();
};

// Static method to find available books
bookSchema.statics.findAvailableBooks = function (): Promise<IBook[]> {
  return this.find({ available: true, copies: { $gt: 0 } });
};

// Static method to find books by genre
bookSchema.statics.findByGenre = function (genre: string): Promise<IBook[]> {
  return this.find({ genre: genre });
};

export const Book = model<IBook, IBookModel>("Book", bookSchema);
