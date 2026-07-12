const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');

// Get all copies for a book
router.get('/book/:bookId', async (req, res, next) => {
  try {
    const copies = await prisma.copy.findMany({
      where: { bookId: req.params.bookId },
      include: { book: true }
    });

    res.json(copies);
  } catch (error) {
    next(error);
  }
});

// Add copy to book
router.post('/', [
  body('bookId').notEmpty(),
  body('barcode').notEmpty().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookId, barcode } = req.body;

    // Verify book exists
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return res.status(404).json({ error: { message: 'Book not found' } });
    }

    const copy = await prisma.copy.create({
      data: {
        bookId,
        barcode,
        status: 'AVAILABLE'
      }
    });

    // Update book copy counts
    await prisma.book.update({
      where: { id: bookId },
      data: {
        totalCopies: { increment: 1 },
        availableCopies: { increment: 1 }
      }
    });

    res.status(201).json({ message: 'Copy added successfully', copy });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: { message: 'Barcode already exists' } });
    }
    next(error);
  }
});

// Update copy status
router.patch('/:id', [
  body('status').notEmpty().isIn(['AVAILABLE', 'BORROWED', 'DAMAGED', 'LOST'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    const copy = await prisma.copy.findUnique({ where: { id: req.params.id } });
    if (!copy) {
      return res.status(404).json({ error: { message: 'Copy not found' } });
    }

    // Update available copies based on status change
    const statusChange = copy.status === 'AVAILABLE' && status !== 'AVAILABLE' ? -1 :
                         copy.status !== 'AVAILABLE' && status === 'AVAILABLE' ? 1 : 0;

    await prisma.$transaction([
      prisma.copy.update({
        where: { id: req.params.id },
        data: { status }
      }),
      ...(statusChange !== 0 ? [prisma.book.update({
        where: { id: copy.bookId },
        data: { availableCopies: { increment: statusChange } }
      })] : [])
    ]);

    res.json({ message: 'Copy status updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete copy
router.delete('/:id', async (req, res, next) => {
  try {
    const copy = await prisma.copy.findUnique({ where: { id: req.params.id } });
    if (!copy) {
      return res.status(404).json({ error: { message: 'Copy not found' } });
    }

    await prisma.$transaction([
      prisma.copy.delete({ where: { id: req.params.id } }),
      prisma.book.update({
        where: { id: copy.bookId },
        data: {
          totalCopies: { decrement: 1 },
          availableCopies: { decrement: copy.status === 'AVAILABLE' ? 1 : 0 }
        }
      })
    ]);

    res.json({ message: 'Copy deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
