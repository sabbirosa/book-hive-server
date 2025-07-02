# Book Hive Server 📚

A minimal library management system backend built with Node.js, Express, TypeScript, and MongoDB.

## Features

✅ **Complete Book Management**
- CRUD operations for books
- Pagination and filtering
- Text search capabilities
- Genre-based filtering
- Availability management

✅ **Borrow Management**
- Book borrowing with quantity validation
- Due date management
- Overdue book tracking
- Comprehensive borrow statistics

✅ **Advanced MongoDB Features**
- Aggregation pipelines for analytics
- Mongoose middleware (pre/post hooks)
- Static and instance methods
- Proper indexing for performance

✅ **Robust Error Handling**
- Consistent error responses
- Validation error handling
- MongoDB error handling
- Development/production error modes

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Validation**: Mongoose built-in validators

## API Endpoints

### Books

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| GET | `/api/books` | Get all books with pagination | `page`, `limit`, `genre`, `available`, `author`, `search`, `sortBy`, `sortOrder` |
| GET | `/api/books/available` | Get only available books | - |
| GET | `/api/books/genre/:genre` | Get books by genre | - |
| GET | `/api/books/:id` | Get single book | - |
| POST | `/api/books` | Create new book | - |
| PATCH | `/api/books/:id` | Update book | - |
| PATCH | `/api/books/:id/availability` | Update book availability | - |
| DELETE | `/api/books/:id` | Delete book | - |

### Borrows

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| GET | `/api/borrows` | Get all borrows with pagination | `page`, `limit`, `book`, `overdue`, `sortBy`, `sortOrder` |
| POST | `/api/borrows` | Borrow a book | - |
| GET | `/api/borrows/summary` | Get borrow summary (aggregation) | - |
| GET | `/api/borrows/overdue` | Get overdue books | - |
| GET | `/api/borrows/statistics` | Get borrow statistics | - |
| GET | `/api/borrows/book/:bookId` | Get total borrowed for specific book | - |

## Request/Response Examples

### Create Book
```bash
POST /api/books
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "genre": "FICTION",
  "isbn": "978-0-7432-7356-5",
  "description": "A classic American novel",
  "copies": 5
}
```

### Borrow Book
```bash
POST /api/borrows
Content-Type: application/json

{
  "book": "64f8a1b2c3d4e5f6789abcde",
  "quantity": 2,
  "dueDate": "2024-02-15T00:00:00.000Z"
}
```

### Get Books with Filters
```bash
GET /api/books?page=1&limit=10&genre=FICTION&available=true&search=gatsby
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote connection)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd book-hive-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/book-hive
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## Database Schema

### Book Schema
```typescript
{
  title: string (required, 1-200 chars)
  author: string (required, 1-100 chars)
  genre: enum ['FICTION', 'NON_FICTION', 'SCIENCE', 'HISTORY', 'BIOGRAPHY', 'FANTASY']
  isbn: string (required, unique, validated format)
  description: string (optional, max 1000 chars)
  copies: number (required, min 0, integer)
  available: boolean (default true, auto-managed)
  createdAt: Date
  updatedAt: Date
}
```

### Borrow Schema
```typescript
{
  book: ObjectId (ref: Book, required)
  quantity: number (required, min 1, integer)
  dueDate: Date (required, future date)
  createdAt: Date
  updatedAt: Date
}
```

## Business Logic

### Book Availability
- Books are automatically marked unavailable when copies reach 0
- Availability is managed through Mongoose middleware
- Instance methods available for manual availability updates

### Borrowing Rules
- Cannot borrow more copies than available
- Due date must be in the future
- Book copies are automatically decremented on borrow
- Validation happens at both controller and model level

## MongoDB Features Used

### Aggregation Pipelines
- **Borrow Summary**: Groups borrows by book with totals
- **Statistics**: Complex multi-facet aggregation for dashboard data
- **Overdue Analysis**: Date-based filtering and grouping

### Mongoose Middleware
- **Pre-save**: Validates availability based on copies
- **Post-save**: Logs operations and updates related documents

### Static Methods
- `Book.findAvailableBooks()`: Returns only available books
- `Book.findByGenre()`: Genre-based filtering
- `Borrow.getBorrowSummary()`: Enhanced aggregation with book details
- `Borrow.getOverdueBooks()`: Date-based filtering with population

### Instance Methods
- `book.isAvailable()`: Check real-time availability
- `book.updateAvailability()`: Manual availability update
- `borrow.isOverdue()`: Check if borrow is overdue

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Specific field error"
  }
}
```

### Error Types Handled
- Validation errors (400)
- Duplicate key errors (400)
- Cast errors - Invalid ObjectId (400)
- Not found errors (404)
- Server errors (500)

## Development

### Available Scripts
```bash
npm run dev      # Start development server with auto-reload
npm run build    # Build TypeScript to JavaScript
npm start        # Start production server
npm run lint     # Run ESLint (if configured)
```

### Code Structure
```
src/
├── app/
│   ├── controller/          # Route handlers
│   ├── models/             # Mongoose schemas and models
│   ├── routes/             # Express routes
│   ├── middlewares/        # Custom middleware
│   └── constants/          # Application constants
├── app.ts                  # Express app configuration
└── server.ts               # Server entry point
```

## Contributing

1. Follow TypeScript best practices
2. Use Mongoose validation for data integrity
3. Handle errors appropriately
4. Add JSDoc comments for complex functions
5. Follow the existing code structure

## License

MIT License - see LICENSE file for details 