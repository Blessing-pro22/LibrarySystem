require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

// Import routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const copyRoutes = require('./routes/copies');
const memberRoutes = require('./routes/members');
const loanRoutes = require('./routes/loans');
const dashboardRoutes = require('./routes/dashboard');

// Import middleware
const { authenticateToken, authorizeRoles } = require('./middleware/auth');

// Import scheduled tasks
const { checkDueDatesAndSendReminders } = require('./utils/emailScheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Library Management System API is running' });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/books', authenticateToken, bookRoutes);
app.use('/api/copies', authenticateToken, authorizeRoles('LIBRARIAN'), copyRoutes);
app.use('/api/members', authenticateToken, memberRoutes);
app.use('/api/loans', authenticateToken, loanRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Route not found' } });
});

// Schedule email reminders (runs daily at 9 AM)
cron.schedule('0 9 * * *', async () => {
  console.log('Running scheduled email reminder check...');
  await checkDueDatesAndSendReminders();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
