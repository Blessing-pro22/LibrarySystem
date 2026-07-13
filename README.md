# Library Management System

A comprehensive automated library management system built with Node.js, Express, PostgreSQL, Prisma, and React.

## Features

### Core MVP Features
- **User Authentication**: Role-based access control (Librarian and Member roles)
- **Catalog Management**: Add, edit, search, and view books with copy tracking
- **Circulation Workflows**: Checkout, return, due date tracking, and overdue status
- **Member Management**: Registration, profile viewing, and member status management
- **Dashboard**: Real-time statistics on books, members, and loans

### Automated Features
- **Scheduled Email Reminders**: Automatic email notifications for upcoming due dates and overdue items
- **Overdue Detection**: Automatic status updates for overdue loans

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **Prisma** ORM
- **JWT** for authentication
- **node-cron** for scheduled tasks
- **nodemailer** for email notifications

### Frontend
- **React** with Vite
- **React Router** for navigation
- **TailwindCSS** for styling
- **Lucide React** for icons
- **Axios** for API calls

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd "Automated Library System"
```

### 2. Install dependencies

Install root dependencies:
```bash
npm install
```

Install backend dependencies:
```bash
cd server
npm install
```

Install frontend dependencies:
```bash
cd ../client
npm install
```

### 3. Set up the database

1. Create a PostgreSQL database named `library_db`
2. Configure the database connection in `server/.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/library_db?schema=public"
```

3. Run Prisma migrations:
```bash
cd server
npx prisma migrate dev --name init
```

4. Generate Prisma client:
```bash
npx prisma generate
```

### 4. Configure environment variables

Copy the example environment file and configure it:
```bash
cd server
cp .env.example .env
```

Update the following variables in `server/.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/library_db?schema=public"
JWT_SECRET="your-secret-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000

# Email Configuration (optional, for due date reminders)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="Library System <noreply@library.com>"
```

### 5. Run the application

Start both backend and frontend in development mode:
```bash
cd ..
npm run dev
```

Or start them separately:

Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

### Initial Setup

1. Register a librarian account:
   - Go to http://localhost:3000/register
   - Fill in the registration form
   - The system will create a member account by default

2. To create a librarian account, you'll need to manually update the user role in the database:
```bash
cd server
npx prisma studio
```
Then navigate to the User table and change the role to `LIBRARIAN`.

### Adding Books

1. Log in as a librarian
2. Navigate to the Books page
3. Click "Add Book"
4. Fill in the book details and number of copies
5. The system will automatically create the specified number of copies

### Managing Loans

1. Navigate to the Loans page
2. Click "Checkout Book"
3. Enter the Member ID and Copy ID
4. Set the due date (default is 14 days)
5. The book will be checked out to the member

### Returning Books

1. Navigate to the Loans page
2. Find the active loan
3. Click the return icon
4. The book will be marked as returned and the copy will be available again

### Email Reminders

To enable email reminders:
1. Configure the email settings in `server/.env`
2. For Gmail, use an App Password (not your regular password)
3. The system runs a daily check at 9 AM and sends reminders for:
   - Books due in the next 3 days
   - Overdue books

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Books
- `GET /api/books` - Get all books (with search and pagination)
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create book (Librarian only)
- `PUT /api/books/:id` - Update book (Librarian only)
- `DELETE /api/books/:id` - Delete book (Librarian only)

### Copies
- `GET /api/copies/book/:bookId` - Get copies for a book
- `POST /api/copies` - Add copy (Librarian only)
- `PATCH /api/copies/:id` - Update copy status (Librarian only)
- `DELETE /api/copies/:id` - Delete copy (Librarian only)

### Members
- `GET /api/members` - Get all members (Librarian only)
- `GET /api/members/:id` - Get single member
- `GET /api/members/profile/me` - Get current member profile
- `PUT /api/members/:id` - Update member
- `PATCH /api/members/:id/deactivate` - Deactivate member (Librarian only)
- `PATCH /api/members/:id/activate` - Activate member (Librarian only)

### Loans
- `GET /api/loans` - Get all loans
- `GET /api/loans/:id` - Get single loan
- `POST /api/loans` - Checkout book (Librarian only)
- `PATCH /api/loans/:id/return` - Return book (Librarian only)
- `PATCH /api/loans/:id/renew` - Renew loan (Librarian only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-loans` - Get recent loans
- `GET /api/dashboard/overdue-loans` - Get overdue loans
- `GET /api/dashboard/due-soon` - Get loans due soon
- `GET /api/dashboard/popular-books` - Get popular books

## Database Schema

The system uses the following entities:
- **User**: Authentication and role management
- **Member**: Member profiles and information
- **Book**: Book catalog information
- **Copy**: Physical copies of books with barcode tracking
- **Loan**: Loan records with due dates and status

## Future Enhancements

After MVP validation, consider adding:
- Barcode/RFID support for faster checkout
- Reservation system for popular books
- Fine calculation and payment system
- Advanced reporting and analytics
- Book recommendations
- Mobile app

## License

MIT

## Support

For issues and questions, please open an issue in the repository.

# LibrarySystem