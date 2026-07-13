const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');

// Get all loans (Librarian can see all, Members only their own)
router.get('/', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (req.user.role === 'MEMBER') {
      const member = await prisma.member.findUnique({ where: { userId: req.user.id } });
      if (member) {
        where.memberId = member.id;
      }
    }

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          member: { include: { user: true } },
          copy: { include: { book: true } }
        },
        orderBy: { loanDate: 'desc' }
      }),
      prisma.loan.count({ where })
    ]);

    res.json({
      loans,
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

// Get single loan
router.get('/:id', async (req, res, next) => {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: req.params.id },
      include: {
        member: { include: { user: true } },
        copy: { include: { book: true } }
      }
    });

    if (!loan) {
      return res.status(404).json({ error: { message: 'Loan not found' } });
    }

    // Members can only view their own loans
    if (req.user.role === 'MEMBER') {
      const member = await prisma.member.findUnique({ where: { userId: req.user.id } });
      if (loan.memberId !== member.id) {
        return res.status(403).json({ error: { message: 'Access denied' } });
      }
    }

    res.json(loan);
  } catch (error) {
    next(error);
  }
});

// Checkout book (Librarian only, but members can borrow for themselves)
router.post('/', [
  body('memberId').notEmpty(),
  body('copyId').notEmpty(),
  body('dueDate').notEmpty().isISO8601()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { memberId, copyId, dueDate, notes } = req.body;

    // Members can only borrow for themselves
    if (req.user.role === 'MEMBER') {
      const member = await prisma.member.findUnique({ where: { userId: req.user.id } });
      if (!member || member.id !== memberId) {
        return res.status(403).json({ error: { message: 'Members can only borrow books for themselves' } });
      }
    }

    // Verify member exists and is active
    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member || !member.isActive) {
      return res.status(400).json({ error: { message: 'Member not found or inactive' } });
    }

    // Verify copy exists and is available
    const copy = await prisma.copy.findUnique({ where: { id: copyId } });
    if (!copy || copy.status !== 'AVAILABLE') {
      return res.status(400).json({ error: { message: 'Copy not available' } });
    }

    // Create loan and update copy status in transaction
    const loan = await prisma.$transaction(async (tx) => {
      const newLoan = await tx.loan.create({
        data: {
          memberId,
          copyId,
          dueDate: new Date(dueDate),
          notes,
          status: 'ACTIVE'
        },
        include: {
          member: { include: { user: true } },
          copy: { include: { book: true } }
        }
      });

      await tx.copy.update({
        where: { id: copyId },
        data: { status: 'BORROWED' }
      });

      return newLoan;
    });

    res.status(201).json({ message: 'Book checked out successfully', loan });
  } catch (error) {
    next(error);
  }
});

// Return book (Librarian only)
router.patch('/:id/return', async (req, res, next) => {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: req.params.id },
      include: { copy: true }
    });

    if (!loan) {
      return res.status(404).json({ error: { message: 'Loan not found' } });
    }

    if (loan.status === 'RETURNED') {
      return res.status(400).json({ error: { message: 'Book already returned' } });
    }

    // Update loan and copy status in transaction
    const updatedLoan = await prisma.$transaction(async (tx) => {
      const returnedLoan = await tx.loan.update({
        where: { id: req.params.id },
        data: {
          returnDate: new Date(),
          status: 'RETURNED'
        },
        include: {
          member: { include: { user: true } },
          copy: { include: { book: true } }
        }
      });

      await tx.copy.update({
        where: { id: loan.copyId },
        data: { status: 'AVAILABLE' }
      });

      return returnedLoan;
    });

    res.json({ message: 'Book returned successfully', loan: updatedLoan });
  } catch (error) {
    next(error);
  }
});

// Renew loan (extend due date)
router.patch('/:id/renew', [
  body('newDueDate').notEmpty().isISO8601()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { newDueDate } = req.body;

    const loan = await prisma.loan.findUnique({ where: { id: req.params.id } });
    if (!loan) {
      return res.status(404).json({ error: { message: 'Loan not found' } });
    }

    if (loan.status !== 'ACTIVE') {
      return res.status(400).json({ error: { message: 'Cannot renew returned loan' } });
    }

    const updatedLoan = await prisma.loan.update({
      where: { id: req.params.id },
      data: { dueDate: new Date(newDueDate) },
      include: {
        member: { include: { user: true } },
        copy: { include: { book: true } }
      }
    });

    res.json({ message: 'Loan renewed successfully', loan: updatedLoan });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
