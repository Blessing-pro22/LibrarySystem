const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');

// Get all members (Librarian only)
router.get('/', async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: { user: true, loans: true },
        orderBy: { lastName: 'asc' }
      }),
      prisma.member.count({ where })
    ]);

    res.json({
      members,
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

// Get single member
router.get('/:id', async (req, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.params.id },
      include: { user: true, loans: { include: { copy: { include: { book: true } } } } }
    });

    if (!member) {
      return res.status(404).json({ error: { message: 'Member not found' } });
    }

    res.json(member);
  } catch (error) {
    next(error);
  }
});

// Get current member profile
router.get('/profile/me', async (req, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { userId: req.user.id },
      include: { user: true, loans: { include: { copy: { include: { book: true } } } } }
    });

    if (!member) {
      return res.status(404).json({ error: { message: 'Member profile not found' } });
    }

    res.json(member);
  } catch (error) {
    next(error);
  }
});

// Update member profile
router.put('/:id', [
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone, address } = req.body;

    // Members can only update their own profile
    if (req.user.role === 'MEMBER') {
      const member = await prisma.member.findUnique({ where: { id: req.params.id } });
      if (member.userId !== req.user.id) {
        return res.status(403).json({ error: { message: 'Can only update own profile' } });
      }
    }

    const member = await prisma.member.update({
      where: { id: req.params.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address })
      }
    });

    res.json({ message: 'Member updated successfully', member });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Member not found' } });
    }
    next(error);
  }
});

// Deactivate member (Librarian only)
router.patch('/:id/deactivate', async (req, res, next) => {
  try {
    const member = await prisma.member.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({ message: 'Member deactivated successfully', member });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Member not found' } });
    }
    next(error);
  }
});

// Activate member (Librarian only)
router.patch('/:id/activate', async (req, res, next) => {
  try {
    const member = await prisma.member.update({
      where: { id: req.params.id },
      data: { isActive: true }
    });

    res.json({ message: 'Member activated successfully', member });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Member not found' } });
    }
    next(error);
  }
});

module.exports = router;
