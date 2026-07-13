const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCopyStatuses() {
  try {
    console.log('Checking copy statuses...');
    
    // Get all copies
    const copies = await prisma.copy.findMany({
      include: { book: true }
    });
    
    console.log(`Found ${copies.length} copies total`);
    
    // Count by status
    const statusCounts = {};
    copies.forEach(copy => {
      statusCounts[copy.status] = (statusCounts[copy.status] || 0) + 1;
    });
    
    console.log('Status breakdown:', statusCounts);
    
    // Find copies that should be AVAILABLE but aren't
    const copiesToFix = copies.filter(copy => copy.status !== 'AVAILABLE');
    
    if (copiesToFix.length > 0) {
      console.log(`Found ${copiesToFix.length} copies with non-AVAILABLE status`);
      
      // Reset all copies to AVAILABLE
      await prisma.copy.updateMany({
        where: { status: { not: 'AVAILABLE' } },
        data: { status: 'AVAILABLE' }
      });
      
      console.log('✅ Reset all copies to AVAILABLE status');
    } else {
      console.log('All copies already have AVAILABLE status');
    }
    
    // Verify the fix
    const updatedCopies = await prisma.copy.findMany({
      include: { book: true }
    });
    
    const availableCount = updatedCopies.filter(c => c.status === 'AVAILABLE').length;
    console.log(`✅ Total available copies: ${availableCount}`);
    
    // Show book-by-book breakdown
    const books = await prisma.book.findMany({
      include: { copies: true }
    });
    
    console.log('\nBook availability breakdown:');
    books.forEach(book => {
      const available = book.copies.filter(c => c.status === 'AVAILABLE').length;
      console.log(`"${book.title}": ${available}/${book.totalCopies} available`);
    });
    
  } catch (error) {
    console.error('Error fixing copy statuses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCopyStatuses();
