const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

// Get dashboard statistics
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalBooks,
      totalCopies,
      availableCopies,
      totalMembers,
      activeMembers,
      totalLoans,
      activeLoans,
      overdueLoans,
      returnedToday,
      membersByCity,
      membersByState,
      newMembersThisMonth
    ] = await Promise.all([
      prisma.book.count(),
      prisma.copy.count(),
      prisma.copy.count({ where: { status: 'AVAILABLE' } }),
      prisma.member.count(),
      prisma.member.count({ where: { isActive: true } }),
      prisma.loan.count(),
      prisma.loan.count({ where: { status: 'ACTIVE' } }),
      prisma.loan.count({ where: { status: 'OVERDUE' } }),
      prisma.loan.count({
        where: {
          status: 'RETURNED',
          returnDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.member.groupBy({
        by: ['city'],
        where: { city: { not: null } },
        _count: true,
        orderBy: { _count: { city: 'desc' } },
        take: 10
      }),
      prisma.member.groupBy({
        by: ['state'],
        where: { state: { not: null } },
        _count: true,
        orderBy: { _count: { state: 'desc' } },
        take: 10
      }),
      prisma.member.count({
        where: {
          joinedAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      })
    ]);

    res.json({
      books: {
        total: totalBooks,
        copies: totalCopies,
        available: availableCopies,
        borrowed: totalCopies - availableCopies
      },
      members: {
        total: totalMembers,
        active: activeMembers,
        inactive: totalMembers - activeMembers,
        newThisMonth: newMembersThisMonth,
        byCity: membersByCity.map(item => ({ city: item.city, count: item._count })),
        byState: membersByState.map(item => ({ state: item.state, count: item._count }))
      },
      loans: {
        total: totalLoans,
        active: activeLoans,
        overdue: overdueLoans,
        returnedToday
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get recent loans
router.get('/recent-loans', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const loans = await prisma.loan.findMany({
      take: limit,
      orderBy: { loanDate: 'desc' },
      include: {
        member: { include: { user: true } },
        copy: { include: { book: true } }
      }
    });

    res.json(loans);
  } catch (error) {
    next(error);
  }
});

// Get overdue loans
router.get('/overdue-loans', async (req, res, next) => {
  try {
    const overdueLoans = await prisma.loan.findMany({
      where: {
        status: 'ACTIVE',
        dueDate: { lt: new Date() }
      },
      include: {
        member: { include: { user: true } },
        copy: { include: { book: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json(overdueLoans);
  } catch (error) {
    next(error);
  }
});

// Get due soon loans (next 3 days)
router.get('/due-soon', async (req, res, next) => {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const dueSoonLoans = await prisma.loan.findMany({
      where: {
        status: 'ACTIVE',
        dueDate: {
          gte: new Date(),
          lte: threeDaysFromNow
        }
      },
      include: {
        member: { include: { user: true } },
        copy: { include: { book: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json(dueSoonLoans);
  } catch (error) {
    next(error);
  }
});

// Get popular books (most borrowed)
router.get('/popular-books', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const books = await prisma.book.findMany({
      take: limit,
      include: {
        copies: {
          include: {
            loans: true
          }
        }
      },
      orderBy: {
        totalCopies: 'desc'
      }
    });

    // Calculate borrow count for each book
    const booksWithBorrowCount = books.map(book => ({
      ...book,
      borrowCount: book.copies.reduce((sum, copy) => sum + copy.loans.length, 0)
    })).sort((a, b) => b.borrowCount - a.borrowCount);

    res.json(booksWithBorrowCount);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
