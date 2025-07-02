import { Document, model, Model, Schema, Types } from "mongoose";

export interface IBorrow extends Document {
  book: Types.ObjectId;
  quantity: number;
  dueDate: Date;
  isOverdue(): boolean;
}

export interface IBorrowModel extends Model<IBorrow> {
  getBorrowSummary(): Promise<any[]>;
  getOverdueBooks(): Promise<IBorrow[]>;
  getTotalBorrowedForBook(bookId: string): Promise<number>;
}

const borrowSchema = new Schema<IBorrow>(
  {
    book: { 
      type: Schema.Types.ObjectId, 
      ref: "Book", 
      required: [true, 'Book reference is required']
    },
    quantity: { 
      type: Number, 
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be a whole number'
      }
    },
    dueDate: { 
      type: Date, 
      required: [true, 'Due date is required'],
      validate: {
        validator: function(v: Date) {
          return v > new Date();
        },
        message: 'Due date must be in the future'
      }
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
borrowSchema.index({ book: 1 });
borrowSchema.index({ dueDate: 1 });
borrowSchema.index({ createdAt: -1 });

// Removed middleware - using atomic operations in controller instead

// Instance method to check if book is overdue
borrowSchema.methods.isOverdue = function(): boolean {
  return new Date() > this.dueDate;
};

// Static method for borrow summary aggregation
borrowSchema.statics.getBorrowSummary = function(): Promise<any[]> {
  return this.aggregate([
    {
      $group: {
        _id: "$book",
        totalQuantityBorrowed: { $sum: "$quantity" },
        borrowCount: { $sum: 1 },
        lastBorrowDate: { $max: "$createdAt" }
      },
    },
    {
      $lookup: {
        from: "books",
        localField: "_id",
        foreignField: "_id",
        as: "book",
      },
    },
    {
      $unwind: "$book",
    },
    {
      $project: {
        _id: "$_id",
        book: {
          _id: "$book._id",
          title: "$book.title",
          author: "$book.author",
          isbn: "$book.isbn",
          genre: "$book.genre"
        },
        totalQuantityBorrowed: 1,
        borrowCount: 1,
        lastBorrowDate: 1
      },
    },
    {
      $sort: { totalQuantityBorrowed: -1 }
    }
  ]);
};

// Static method to get overdue books
borrowSchema.statics.getOverdueBooks = function(): Promise<IBorrow[]> {
  return this.find({
    dueDate: { $lt: new Date() }
  }).populate('book', 'title author isbn');
};

// Static method to get total borrowed quantity for a specific book
borrowSchema.statics.getTotalBorrowedForBook = function(bookId: string): Promise<number> {
  return this.aggregate([
    {
      $match: { book: new Types.ObjectId(bookId) }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$quantity" }
      }
    }
  ]).then(result => result[0]?.total || 0);
};

export const Borrow = model<IBorrow, IBorrowModel>("Borrow", borrowSchema);
