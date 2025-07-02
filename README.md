# BookHive Server

A robust backend API for the BookHive library management system, providing comprehensive book and borrowing management functionality.

## 🚀 Features

- **RESTful API**: Complete REST API for book and borrow management
- **Book Management**: CRUD operations for book catalog
- **Borrowing System**: Track book borrowing and returns
- **Data Validation**: Comprehensive input validation and error handling
- **Database Integration**: MongoDB with Mongoose ODM
- **TypeScript**: Full TypeScript support for type safety
- **Scalable Architecture**: Modular design with separation of concerns

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Built-in middleware validation
- **CORS**: Cross-origin resource sharing enabled
- **Development**: ts-node-dev for hot reloading
- **Deployment**: Vercel-ready configuration

## 📋 Prerequisites

- **Node.js**: Version 18 or higher
- **MongoDB**: Local installation or MongoDB Atlas account
- **npm**: Version 8 or higher

## 🚀 Getting Started

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/sabbirosa/book-hive-server
   cd book-hive-server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:8000`

## 📜 Available Scripts

| Script          | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start development server with hot reload |
| `npm start`     | Start production server                  |
| `npm run build` | Compile TypeScript to JavaScript         |
| `npm run lint`  | Run ESLint for code quality              |

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/bookhive
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookhive

# Server
PORT=5000
NODE_ENV=development

# CORS (optional)
CORS_ORIGIN=http://localhost:5173 or '*' for all origins
```

## 📚 API Documentation

### Base URL

```
http://localhost:8000/api
```

### Books API

#### Get All Books

```http
GET /api/books
```

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search in title and author
- `genre`: Filter by genre

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "title": "string",
      "author": "string",
      "genre": "string",
      "isbn": "string",
      "description": "string",
      "copies": 5,
      "available": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalBooks": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Get Available Books

```http
GET /api/books/available
```

#### Get Books by Genre

```http
GET /api/books/genre/:genre
```

#### Get Book by ID

```http
GET /api/books/:id
```

#### Create Book

```http
POST /api/books
Content-Type: application/json

{
  "title": "string",
  "author": "string",
  "genre": "string",
  "isbn": "string",
  "description": "string",
  "copies": 5
}
```

#### Update Book

```http
PUT /api/books/:id
Content-Type: application/json

{
  "title": "string",
  "copies": 3
  // Other updatable fields
}
```

#### Update Book Availability

```http
PUT /api/books/:id/availability
Content-Type: application/json

{
  "available": false
}
```

#### Delete Book

```http
DELETE /api/books/:id
```

### Borrows API

#### Get All Borrows

```http
GET /api/borrows
```

**Query Parameters:**

- `page`: Page number
- `limit`: Items per page

#### Create Borrow

```http
POST /api/borrows
Content-Type: application/json

{
  "book": "book_id",
  "quantity": 1,
  "dueDate": "2024-12-31"
}
```

#### Get Borrow Summary

```http
GET /api/borrows/summary
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "book": {
        "_id": "string",
        "title": "string",
        "author": "string",
        "genre": "string",
        "isbn": "string"
      },
      "totalQuantityBorrowed": 5
    }
  ],
  "count": 10
}
```

## 🗄️ Database Models

### Book Model

```typescript
{
  title: string;          // Required, 1-200 characters
  author: string;         // Required, 1-100 characters
  genre: string;          // Required
  isbn: string;           // Required, unique
  description?: string;   // Optional, max 1000 characters
  copies: number;         // Required, non-negative integer
  available: boolean;     // Auto-calculated based on copies
  createdAt: Date;        // Auto-generated
  updatedAt: Date;        // Auto-generated
}
```

### Borrow Model

```typescript
{
  book: ObjectId; // Reference to Book
  quantity: number; // Required, positive integer
  dueDate: Date; // Required
  createdAt: Date; // Auto-generated
  updatedAt: Date; // Auto-generated
}
```

## 🚀 Deployment

### Vercel Deployment

The project includes a `vercel.json` configuration for easy deployment:

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Deploy**

   ```bash
   vercel
   ```

3. **Set Environment Variables**
   Configure your MongoDB URI and other environment variables in the Vercel dashboard.

### Manual Deployment

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```
