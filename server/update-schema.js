const { execSync } = require('child_process');
const path = require('path');

console.log('Updating database schema to add imageUrl field...');

try {
  // Try to push schema changes
  execSync('npx prisma db push', {
    cwd: path.join(__dirname, 'server'),
    stdio: 'inherit'
  });
  
  console.log('✅ Schema updated successfully!');
  console.log('Now run: node server/seed-books.js to add images to existing books');
} catch (error) {
  console.error('❌ Failed to update schema:', error.message);
  console.log('Please make sure your database is running and try again.');
}
