const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');

// Get all books with pagination and search
router.get('/', async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: { copies: true },
        orderBy: { title: 'asc' }
      }),
      prisma.book.count({ where })
    ]);

    // Calculate available copies dynamically based on copy status
    const booksWithAvailableCount = books.map(book => ({
      ...book,
      availableCopies: book.copies.filter(copy => copy.status === 'AVAILABLE').length
    }));

    res.json({
      books: booksWithAvailableCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single book
router.get('/:id', async (req, res, next) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: req.params.id },
      include: { copies: true }
    });

    if (!book) {
      return res.status(404).json({ error: { message: 'Book not found' } });
    }

    // Calculate available copies dynamically based on copy status
    const bookWithAvailableCount = {
      ...book,
      availableCopies: book.copies.filter(copy => copy.status === 'AVAILABLE').length
    };

    res.json(bookWithAvailableCount);
  } catch (error) {
    next(error);
  }
});

// Create book (Librarian only)
router.post('/', [
  body('isbn').notEmpty().trim(),
  body('title').notEmpty().trim(),
  body('author').notEmpty().trim(),
  body('totalCopies').optional().isInt({ min: 0 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isbn, title, author, publisher, publishedYear, category, description, totalCopies = 1 } = req.body;

    const book = await prisma.book.create({
      data: {
        isbn,
        title,
        author,
        publisher,
        publishedYear,
        category,
        description,
        totalCopies,
        availableCopies: totalCopies
      }
    });

    res.status(201).json({ message: 'Book created successfully', book });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: { message: 'Book with this ISBN already exists' } });
    }
    next(error);
  }
});

// Update book (Librarian only)
router.put('/:id', [
  body('isbn').optional().notEmpty().trim(),
  body('title').optional().notEmpty().trim(),
  body('author').optional().notEmpty().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isbn, title, author, publisher, publishedYear, category, description, totalCopies } = req.body;

    const book = await prisma.book.update({
      where: { id: req.params.id },
      data: {
        ...(isbn && { isbn }),
        ...(title && { title }),
        ...(author && { author }),
        ...(publisher !== undefined && { publisher }),
        ...(publishedYear !== undefined && { publishedYear }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(totalCopies !== undefined && { totalCopies })
      }
    });

    res.json({ message: 'Book updated successfully', book });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Book not found' } });
    }
    next(error);
  }
});

// Delete book (Librarian only)
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.book.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Book not found' } });
    }
    next(error);
  }
});

module.exports = router;
