const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const bookImages = {
  '978-0-06-112008-4': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/to-kill-a-mockingbird.jpg',
  '978-0-7432-7356-5': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/1984.jpg',
  '978-0-452-28423-4': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-great-gatsby.jpg',
  '978-0-06-231500-7': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-hunger-games.jpg',
  '978-0-316-76948-0': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-catcher-in-the-rye.jpg',
  '978-0-307-27778-0': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-da-vinci-code.jpg',
  '978-0-679-72100-2': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/harry-potter.jpg',
  '978-0-14-028329-7': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/lotr-fellowship.jpg',
  '978-0-307-47427-8': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-alchemist.jpg',
  '978-0-316-01581-7': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-book-thief.jpg',
  '978-0-14-027736-8': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/pride-and-prejudice.jpg',
  '978-0-451-52493-6': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/brave-new-world.jpg',
  '978-0-312-19554-5': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-kite-runner.jpg',
  '978-0-316-01692-0': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/life-of-pi.jpg',
  '978-0-679-41003-6': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-road.jpg',
  '978-0-307-27777-3': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-girl-with-the-dragon-tattoo.jpg',
  '978-0-345-39180-3': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-hobbit.jpg',
  '978-0-553-38011-7': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-shining.jpg',
  '978-0-670-81302-4': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-name-of-the-wind.jpg',
  '978-0-316-01784-3': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-wise-mans-fear.jpg',
  '978-0-553-29335-7': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/game-of-thrones.jpg',
  '978-0-553-80150-2': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/dune.jpg',
  '978-0-439-02348-1': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-lightning-thief.jpg',
  '978-0-525-47881-7': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-fault-in-our-stars.jpg',
  '978-0-307-58837-1': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/gone-girl.jpg',
  '978-1-250-30297-4': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-silent-patient.jpg',
  '978-0-452-27346-5': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/beloved.jpg',
  '978-0-671-72796-5': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-color-purple.jpg',
  '978-0-679-72326-6': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-handmaids-tale.jpg',
  '978-0-316-76949-7': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/fahrenheit-451.jpg',
  '978-0-316-01691-3': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-martian.jpg',
  '978-0-307-88744-3': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/ready-player-one.jpg',
  '978-0-8125-5070-7': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/enders-game.jpg',
  '978-0-345-41853-9': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-help.jpg',
  '978-1-4767-7654-3': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/all-the-light-we-cannot-see.jpg',
  '978-0-312-57739-3': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-nightingale.jpg',
  '978-0-7352-21309-0': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/where-the-crawdads-sing.jpg',
  '978-0-593-44962-4': 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/project-hail-mary.jpg'
};

async function addImagesToBooks() {
  try {
    console.log('🖼️  Adding images to existing books...');
    
    let updatedCount = 0;
    
    for (const [isbn, imageUrl] of Object.entries(bookImages)) {
      try {
        const book = await prisma.book.findUnique({
          where: { isbn }
        });
        
        if (book) {
          await prisma.book.update({
            where: { isbn },
            data: { imageUrl }
          });
          
          console.log(`✅ Updated: "${book.title}"`);
          updatedCount++;
        }
      } catch (error) {
        console.log(`⚠️  Skipped ISBN ${isbn}: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} books with images!`);
    
  } catch (error) {
    console.error('❌ Error adding images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addImagesToBooks();
