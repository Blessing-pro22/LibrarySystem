const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const { body, validationResult } = require('express-validator');
const prisma   = require('../config/database');
const cloudinary = require('../config/cloudinary');
const { fetchAndStoreCover } = require('../services/coverFetch');
const { authorizeRoles } = require('../middleware/auth');

// Multer: store upload in memory (max 2 MB, images only)
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 2 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only jpg, png, and webp images are allowed'));
    }
  },
});

// ─── helpers ────────────────────────────────────────────────────────────────

function withAvailableCount(book) {
  return {
    ...book,
    availableCopies: book.copies.filter((c) => c.status === 'AVAILABLE').length,
  };
}

/** Upload a Buffer directly to Cloudinary via a stream. */
function uploadBufferToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:        'library-covers',
        public_id:     publicId,
        overwrite:     true,
        resource_type: 'image',
        transformation: [{ width: 400, height: 600, crop: 'fill', gravity: 'center' }],
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

// ─── routes ─────────────────────────────────────────────────────────────────

// GET /api/books — list with search / pagination
router.get('/', async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { title:  { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn:   { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip:    parseInt(skip),
        take:    parseInt(limit),
        include: { copies: true },
        orderBy: { title: 'asc' },
      }),
      prisma.book.count({ where }),
    ]);

    res.json({
      books: books.map(withAvailableCount),
      pagination: {
        page:  parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/books/:id
router.get('/:id', async (req, res, next) => {
  try {
    const book = await prisma.book.findUnique({
      where:   { id: req.params.id },
      include: { copies: true },
    });
    if (!book) return res.status(404).json({ error: { message: 'Book not found' } });
    res.json(withAvailableCount(book));
  } catch (error) {
    next(error);
  }
});

// POST /api/books — create (Librarian only)
router.post('/', authorizeRoles('LIBRARIAN'), [
  body('isbn').notEmpty().trim(),
  body('title').notEmpty().trim(),
  body('author').notEmpty().trim(),
  body('totalCopies').optional().isInt({ min: 0 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      isbn, title, author, publisher, publishedYear,
      category, description, totalCopies = 1,
    } = req.body;

    const book = await prisma.book.create({
      data: {
        isbn, title, author, publisher, publishedYear,
        category, description,
        totalCopies,
        availableCopies: totalCopies,
      },
    });

    // Attempt auto-cover fetch in the background — don't block the response
    fetchAndStoreCover(isbn)
      .then((coverUrl) => {
        if (coverUrl) {
          return prisma.book.update({ where: { id: book.id }, data: { coverUrl } });
        }
      })
      .catch((err) => console.error('Background cover fetch failed:', err.message));

    res.status(201).json({ message: 'Book created successfully', book });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: { message: 'Book with this ISBN already exists' } });
    }
    next(error);
  }
});

// PUT /api/books/:id — update (Librarian only)
router.put('/:id', authorizeRoles('LIBRARIAN'), [
  body('isbn').optional().notEmpty().trim(),
  body('title').optional().notEmpty().trim(),
  body('author').optional().notEmpty().trim(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { isbn, title, author, publisher, publishedYear, category, description, totalCopies } =
      req.body;

    const book = await prisma.book.update({
      where: { id: req.params.id },
      data: {
        ...(isbn        && { isbn }),
        ...(title       && { title }),
        ...(author      && { author }),
        ...(publisher   !== undefined && { publisher }),
        ...(publishedYear !== undefined && { publishedYear }),
        ...(category    !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(totalCopies !== undefined && { totalCopies }),
      },
    });

    res.json({ message: 'Book updated successfully', book });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Book not found' } });
    }
    next(error);
  }
});

// DELETE /api/books/:id (Librarian only)
router.delete('/:id', authorizeRoles('LIBRARIAN'), async (req, res, next) => {
  try {
    await prisma.book.delete({ where: { id: req.params.id } });
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Book not found' } });
    }
    next(error);
  }
});

// POST /api/books/:id/cover — manual cover upload (Librarian only)
router.post(
  '/:id/cover',
  authorizeRoles('LIBRARIAN'),
  (req, res, next) => {
    upload.single('cover')(req, res, (err) => {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: { message: 'Image must be 2 MB or smaller' } });
      }
      if (err) {
        return res.status(400).json({ error: { message: err.message } });
      }
      next();
    });
  },
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: { message: 'No image file provided' } });
      }

      const book = await prisma.book.findUnique({ where: { id: req.params.id } });
      if (!book) return res.status(404).json({ error: { message: 'Book not found' } });

      const result = await uploadBufferToCloudinary(
        req.file.buffer,
        `isbn-${book.isbn}`
      );

      const updated = await prisma.book.update({
        where: { id: req.params.id },
        data:  { coverUrl: result.secure_url },
      });

      res.json({ message: 'Cover uploaded successfully', coverUrl: updated.coverUrl });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/books/:id/cover/refresh — re-run auto-fetch (Librarian only)
router.post('/:id/cover/refresh', authorizeRoles('LIBRARIAN'), async (req, res, next) => {
  try {
    const book = await prisma.book.findUnique({ where: { id: req.params.id } });
    if (!book) return res.status(404).json({ error: { message: 'Book not found' } });

    const coverUrl = await fetchAndStoreCover(book.isbn);

    if (!coverUrl) {
      return res.json({ message: 'No cover found for this ISBN', coverUrl: null });
    }

    const updated = await prisma.book.update({
      where: { id: req.params.id },
      data:  { coverUrl },
    });

    res.json({ message: 'Cover refreshed successfully', coverUrl: updated.coverUrl });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
