const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const books = [
  {
    isbn: '978-0-06-112008-4',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    publisher: 'J. B. Lippincott & Co.',
    publishedYear: 1960,
    category: 'Classic Literature',
    description: 'A novel about the serious issues of rape and racial inequality, told from the perspective of a young girl named Scout Finch.',
    totalCopies: 3,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/to-kill-a-mockingbird.jpg'
  },
  {
    isbn: '978-0-7432-7356-5',
    title: '1984',
    author: 'George Orwell',
    publisher: 'Secker & Warburg',
    publishedYear: 1949,
    category: 'Dystopian Fiction',
    description: 'A dystopian social science fiction novel and cautionary tale about the future.',
    totalCopies: 4,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/1984.jpg'
  },
  {
    isbn: '978-0-452-28423-4',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    publisher: 'Charles Scribner\'s Sons',
    publishedYear: 1925,
    category: 'Classic Literature',
    description: 'A novel set in the Jazz Age on Long Island, exploring themes of decadence, idealism, and social upheaval.',
    totalCopies: 3,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-great-gatsby.jpg'
  },
  {
    isbn: '978-0-06-231500-7',
    title: 'The Hunger Games',
    author: 'Suzanne Collins',
    publisher: 'Scholastic Press',
    publishedYear: 2008,
    category: 'Young Adult',
    description: 'A dystopian novel about a televised competition in which teenagers fight to the death.',
    totalCopies: 5,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-hunger-games.jpg'
  },
  {
    isbn: '978-0-316-76948-0',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    publisher: 'Little, Brown and Company',
    publishedYear: 1951,
    category: 'Classic Literature',
    description: 'A story about the events in the life of Holden Caulfield, a rebellious teenager.',
    totalCopies: 3,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-catcher-in-the-rye.jpg'
  },
  {
    isbn: '978-0-307-27778-0',
    title: 'The Da Vinci Code',
    author: 'Dan Brown',
    publisher: 'Doubleday',
    publishedYear: 2003,
    category: 'Mystery Thriller',
    description: 'A mystery thriller novel that follows symbologist Robert Langdon as he investigates a murder in the Louvre.',
    totalCopies: 4,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-da-vinci-code.jpg'
  },
  {
    isbn: '978-0-679-72100-2',
    title: 'Harry Potter and the Sorcerer\'s Stone',
    author: 'J.K. Rowling',
    publisher: 'Bloomsbury',
    publishedYear: 1997,
    category: 'Fantasy',
    description: 'The first novel in the Harry Potter series, following a young wizard who discovers his magical heritage.',
    totalCopies: 6,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/harry-potter.jpg'
  },
  {
    isbn: '978-0-14-028329-7',
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    author: 'J.R.R. Tolkien',
    publisher: 'George Allen & Unwin',
    publishedYear: 1954,
    category: 'Fantasy',
    description: 'The first volume of an epic high-fantasy novel about a quest to destroy a powerful ring.',
    totalCopies: 4,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/lotr-fellowship.jpg'
  },
  {
    isbn: '978-0-307-47427-8',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    publisher: 'HarperCollins',
    publishedYear: 1988,
    category: 'Fiction',
    description: 'A philosophical novel about a young Andalusian shepherd who travels to Egypt in search of treasure.',
    totalCopies: 3,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-alchemist.jpg'
  },
  {
    isbn: '978-0-316-01581-7',
    title: 'The Book Thief',
    author: 'Markus Zusak',
    publisher: 'Picador',
    publishedYear: 2005,
    category: 'Historical Fiction',
    description: 'A novel set during World War II in Germany, narrated by Death, about a young girl who steals books.',
    totalCopies: 4,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-book-thief.jpg'
  },
  {
    isbn: '978-0-14-027736-8',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    publisher: 'T. Egerton',
    publishedYear: 1813,
    category: 'Romance',
    description: 'A romantic novel that follows the emotional development of Elizabeth Bennet.',
    totalCopies: 3,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/pride-and-prejudice.jpg'
  },
  {
    isbn: '978-0-451-52493-6',
    title: 'Brave New World',
    author: 'Aldous Huxley',
    publisher: 'Chatto & Windus',
    publishedYear: 1932,
    category: 'Dystopian Fiction',
    description: 'A dystopian novel that explores a futuristic society where citizens are genetically engineered.',
    totalCopies: 3,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/brave-new-world.jpg'
  },
  {
    isbn: '978-0-312-19554-5',
    title: 'The Kite Runner',
    author: 'Khaled Hosseini',
    publisher: 'Riverhead Books',
    publishedYear: 2003,
    category: 'Historical Fiction',
    description: 'A story about friendship, betrayal, and redemption set in Afghanistan.',
    totalCopies: 4,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-kite-runner.jpg'
  },
  {
    isbn: '978-0-316-01692-0',
    title: 'Life of Pi',
    author: 'Yann Martel',
    publisher: 'Knopf Canada',
    publishedYear: 2001,
    category: 'Adventure',
    description: 'A philosophical novel about a young man who survives a shipwreck and shares a lifeboat with a Bengal tiger.',
    totalCopies: 3,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/life-of-pi.jpg'
  },
  {
    isbn: '978-0-679-41003-6',
    title: 'The Road',
    author: 'Cormac McCarthy',
    publisher: 'Alfred A. Knopf',
    publishedYear: 2006,
    category: 'Post-Apocalyptic',
    description: 'A novel about a father and son journeying through a post-apocalyptic landscape.',
    totalCopies: 3,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-road.jpg'
  },
  {
    isbn: '978-0-307-27777-3',
    title: 'The Girl with the Dragon Tattoo',
    author: 'Stieg Larsson',
    publisher: 'Norstedts Förlag',
    publishedYear: 2005,
    category: 'Mystery Thriller',
    description: 'A crime novel about a journalist and a hacker investigating a disappearance.',
    totalCopies: 4,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-girl-with-the-dragon-tattoo.jpg'
  },
  {
    isbn: '978-0-345-39180-3',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    publisher: 'George Allen & Unwin',
    publishedYear: 1937,
    category: 'Fantasy',
    description: 'A fantasy novel about a hobbit who embarks on an unexpected journey.',
    totalCopies: 5,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-hobbit.jpg'
  },
  {
    isbn: '978-0-553-38011-7',
    title: 'The Shining',
    author: 'Stephen King',
    publisher: 'Doubleday',
    publishedYear: 1977,
    category: 'Horror',
    description: 'A horror novel about a family caretaking an isolated hotel during winter.',
    totalCopies: 3,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-shining.jpg'
  },
  {
    isbn: '978-0-670-81302-4',
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    publisher: 'DAW Books',
    publishedYear: 2007,
    category: 'Fantasy',
    description: 'The first book in the Kingkiller Chronicle, telling the story of a legendary figure.',
    totalCopies: 3,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-name-of-the-wind.jpg'
  },
  {
    isbn: '978-0-316-01784-3',
    title: 'The Wise Man\'s Fear',
    author: 'Patrick Rothfuss',
    publisher: 'DAW Books',
    publishedYear: 2011,
    category: 'Fantasy',
    description: 'The second book in the Kingkiller Chronicle, continuing Kvothe\'s story.',
    totalCopies: 3,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-wise-mans-fear.jpg'
  },
  {
    isbn: '978-0-553-29335-7',
    title: 'A Game of Thrones',
    author: 'George R.R. Martin',
    publisher: 'Bantam Books',
    publishedYear: 1996,
    category: 'Fantasy',
    description: 'The first book in A Song of Ice and Fire series, a tale of power and betrayal.',
    totalCopies: 5,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/game-of-thrones.jpg'
  },
  {
    isbn: '978-0-553-80150-2',
    title: 'Dune',
    author: 'Frank Herbert',
    publisher: 'Chilton Books',
    publishedYear: 1965,
    category: 'Science Fiction',
    description: 'A science fiction novel set in the distant future amidst a feudal interstellar society.',
    totalCopies: 4,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/dune.jpg'
  },
  {
    isbn: '978-0-439-02348-1',
    title: 'The Lightning Thief',
    author: 'Rick Riordan',
    publisher: 'Disney Hyperion',
    publishedYear: 2005,
    category: 'Fantasy',
    description: 'The first book in the Percy Jackson series, about a demigod teenager.',
    totalCopies: 4,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-lightning-thief.jpg'
  },
  {
    isbn: '978-0-525-47881-7',
    title: 'The Fault in Our Stars',
    author: 'John Green',
    publisher: 'Dutton Books',
    publishedYear: 2012,
    category: 'Young Adult',
    description: 'A romance novel about two teenagers with cancer who fall in love.',
    totalCopies: 4,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-fault-in-our-stars.jpg'
  },
  {
    isbn: '978-0-307-58837-1',
    title: 'Gone Girl',
    author: 'Gillian Flynn',
    publisher: 'Crown Publishing Group',
    publishedYear: 2012,
    category: 'Mystery Thriller',
    description: 'A psychological thriller about a marriage gone terribly wrong.',
    totalCopies: 3,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/gone-girl.jpg'
  },
  {
    isbn: '978-1-250-30297-4',
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    publisher: 'Celadon Books',
    publishedYear: 2019,
    category: 'Mystery Thriller',
    description: 'A psychological thriller about a woman who shoots her husband and then never speaks again.',
    totalCopies: 4,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-silent-patient.jpg'
  },
  {
    isbn: '978-0-452-27346-5',
    title: 'Beloved',
    author: 'Toni Morrison',
    publisher: 'Alfred A. Knopf',
    publishedYear: 1987,
    category: 'Classic Literature',
    description: 'A novel about the legacy of slavery in America, told through the story of Sethe.',
    totalCopies: 3,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/beloved.jpg'
  },
  {
    isbn: '978-0-671-72796-5',
    title: 'The Color Purple',
    author: 'Alice Walker',
    publisher: 'Harcourt Brace Jovanovich',
    publishedYear: 1982,
    category: 'Classic Literature',
    description: 'A Pulitzer Prize-winning novel about African American women in the early 20th century.',
    totalCopies: 3,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-color-purple.jpg'
  },
  {
    isbn: '978-0-679-72326-6',
    title: 'The Handmaid\'s Tale',
    author: 'Margaret Atwood',
    publisher: 'McClelland and Stewart',
    publishedYear: 1985,
    category: 'Dystopian Fiction',
    description: 'A dystopian novel set in a totalitarian society where women are subjugated.',
    totalCopies: 4,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-handmaids-tale.jpg'
  },
  {
    isbn: '978-0-316-76949-7',
    title: 'Fahrenheit 451',
    author: 'Ray Bradbury',
    publisher: 'Ballantine Books',
    publishedYear: 1953,
    category: 'Dystopian Fiction',
    description: 'A dystopian novel about a future where books are outlawed and burned.',
    totalCopies: 3,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/fahrenheit-451.jpg'
  },
  {
    isbn: '978-0-316-01691-3',
    title: 'The Martian',
    author: 'Andy Weir',
    publisher: 'Crown Publishing Group',
    publishedYear: 2011,
    category: 'Science Fiction',
    description: 'A science fiction novel about an astronaut stranded on Mars.',
    totalCopies: 4,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-martian.jpg'
  },
  {
    isbn: '978-0-307-88744-3',
    title: 'Ready Player One',
    author: 'Ernest Cline',
    publisher: 'Crown Publishing Group',
    publishedYear: 2011,
    category: 'Science Fiction',
    description: 'A science fiction novel set in a virtual reality world called the OASIS.',
    totalCopies: 4,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/ready-player-one.jpg'
  },
  {
    isbn: '978-0-8125-5070-7',
    title: 'Ender\'s Game',
    author: 'Orson Scott Card',
    publisher: 'Tor Books',
    publishedYear: 1985,
    category: 'Science Fiction',
    description: 'A military science fiction novel about a gifted child trained to defend Earth.',
    totalCopies: 4,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/enders-game.jpg'
  },
  {
    isbn: '978-0-345-41853-9',
    title: 'The Help',
    author: 'Kathryn Stockett',
    publisher: 'Amy Einhorn Books',
    publishedYear: 2009,
    category: 'Historical Fiction',
    description: 'A novel about African American maids working in white households in 1960s Mississippi.',
    totalCopies: 3,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-help.jpg'
  },
  {
    isbn: '978-1-4767-7654-3',
    title: 'All the Light We Cannot See',
    author: 'Anthony Doerr',
    publisher: 'Scribner',
    publishedYear: 2014,
    category: 'Historical Fiction',
    description: 'A novel about a blind French girl and a German boy during World War II.',
    totalCopies: 4,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/all-the-light-we-cannot-see.jpg'
  },
  {
    isbn: '978-0-312-57739-3',
    title: 'The Nightingale',
    author: 'Kristin Hannah',
    publisher: 'St. Martin\'s Press',
    publishedYear: 2015,
    category: 'Historical Fiction',
    description: 'A novel about two sisters in Nazi-occupied France during World War II.',
    totalCopies: 3,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/the-nightingale.jpg'
  },
  {
    isbn: '978-0-7352-21309-0',
    title: 'Where the Crawdads Sing',
    author: 'Delia Owens',
    publisher: 'G.P. Putnam\'s Sons',
    publishedYear: 2018,
    category: 'Mystery',
    description: 'A mystery novel about a girl who grows up alone in the marshes of North Carolina.',
    totalCopies: 5,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/where-the-crawdads-sing.jpg'
  },
  {
    isbn: '978-0-593-44962-4',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    publisher: 'Ballantine Books',
    publishedYear: 2021,
    category: 'Science Fiction',
    description: 'A science fiction novel about a lone astronaut who must save Earth from extinction.',
    totalCopies: 4,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1719424800/book-covers/project-hail-mary.jpg'
  }
];

async function seedBooks() {
  try {
    console.log('Starting to seed books...');
    
    for (const bookData of books) {
      // Check if book already exists
      const existingBook = await prisma.book.findUnique({
        where: { isbn: bookData.isbn }
      });

      if (existingBook) {
        console.log(`Book "${bookData.title}" already exists. Skipping...`);
        continue;
      }

      // Create book with copies
      const book = await prisma.book.create({
        data: {
          isbn: bookData.isbn,
          title: bookData.title,
          author: bookData.author,
          publisher: bookData.publisher,
          publishedYear: bookData.publishedYear,
          category: bookData.category,
          description: bookData.description,
          imageUrl: bookData.imageUrl,
          totalCopies: bookData.totalCopies,
          availableCopies: bookData.totalCopies,
          copies: {
            create: Array.from({ length: bookData.totalCopies }, (_, i) => ({
              barcode: `${bookData.isbn}-${i + 1}`,
              status: 'AVAILABLE'
            }))
          }
        }
      });

      console.log(`✓ Created: "${book.title}" by ${book.author} (${book.totalCopies} copies)`);
    }

    console.log('\n✅ Successfully seeded all books!');
  } catch (error) {
    console.error('Error seeding books:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBooks();
