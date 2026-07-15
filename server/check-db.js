const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseConnection() {
  try {
    console.log('🔍 Checking database connection...');
    console.log('📍 Database URL:', process.env.DATABASE_URL ? 'Set (hidden for security)' : 'NOT SET');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query test passed!');
    
    // Check if books table exists
    try {
      const bookCount = await prisma.book.count();
      console.log(`📚 Found ${bookCount} books in database`);
    } catch (error) {
      console.log('⚠️  Books table might not exist yet');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('Can\'t reach database server')) {
      console.log('\n🔧 Possible solutions:');
      console.log('1. Your Render database might be sleeping (free tier)');
      console.log('2. Check your DATABASE_URL in server/.env');
      console.log('3. Try accessing your Render dashboard to wake up the database');
      console.log('4. Check if the database URL is correct');
    }
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔧 Authentication failed - check your database credentials');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseConnection();
