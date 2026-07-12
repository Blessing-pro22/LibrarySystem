const nodemailer = require('nodemailer');
const prisma = require('../config/database');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send due date reminder email
const sendDueDateReminder = async (member, book, dueDate) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: member.user.email,
    subject: `Reminder: Book Due Soon - ${book.title}`,
    html: `
      <h2>Library Book Due Date Reminder</h2>
      <p>Dear ${member.firstName} ${member.lastName},</p>
      <p>This is a reminder that the book <strong>"${book.title}"</strong> by ${book.author} is due on <strong>${dueDate.toLocaleDateString()}</strong>.</p>
      <p>Please return it to the library before the due date to avoid any late fees.</p>
      <p>If you have already returned this book, please disregard this message.</p>
      <p>Thank you for using our library!</p>
      <p>Best regards,<br>Library Management System</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Due(date reminder sent to ${member.user.email} for book: ${book.title}`);
  } catch (error) {
    console.error(`Failed to send reminder to ${member.user.email}:`, error);
  }
};

// Send overdue notice email
const sendOverdueNotice = async (member, book, dueDate) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: member.user.email,
    subject: `Overdue Notice: ${book.title}`,
    html: `
      <h2>Library Book Overdue Notice</h2>
      <p>Dear ${member.firstName} ${member.lastName},</p>
      <p>The book <strong>"${book.title}"</strong> by ${book.author} was due on <strong>${dueDate.toLocaleDateString()}</strong> and is now overdue.</p>
      <p>Please return it to the library as soon as possible to avoid additional late fees.</p>
      <p>If you have already returned this book, please contact the library staff.</p>
      <p>Thank you for your cooperation.</p>
      <p>Best regards,<br>Library Management System</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Overdue notice sent to ${member.user.email} for book: ${book.title}`);
  } catch (error) {
    console.error(`Failed to send overdue notice to ${member.user.email}:`, error);
  }
};

// Check due dates and send reminders (scheduled task)
const checkDueDatesAndSendReminders = async () => {
  try {
    console.log('Checking due dates for reminders...');

    // Check for loans due in the next 3 days
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
      }
    });

    console.log(`Found ${dueSoonLoans.length} loans due soon`);

    for (const loan of dueSoonLoans) {
      await sendDueDateReminder(loan.member, loan.copy.book, loan.dueDate);
    }

    // Check for overdue loans
    const overdueLoans = await prisma.loan.findMany({
      where: {
        status: 'ACTIVE',
        dueDate: { lt: new Date() }
      },
      include: {
        member: { include: { user: true } },
        copy: { include: { book: true } }
      }
    });

    console.log(`Found ${overdueLoans.length} overdue loans`);

    for (const loan of overdueLoans) {
      // Update loan status to OVERDUE
      await prisma.loan.update({
        where: { id: loan.id },
        data: { status: 'OVERDUE' }
      });
      
      await sendOverdueNotice(loan.member, loan.copy.book, loan.dueDate);
    }

    console.log('Due date check completed');
  } catch (error) {
    console.error('Error checking due dates:', error);
  }
};

module.exports = {
  checkDueDatesAndSendReminders,
  sendDueDateReminder,
  sendOverdueNotice
};
