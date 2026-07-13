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
    totalCopies: 3
  },
  {
    isbn: '978-0-7432-7356-5',
    title: '1984',
    author: 'George Orwell',
    publisher: 'Secker & Warburg',
    publishedYear: 1949,
    category: 'Dystopian Fiction',
    description: 'A dystopian social science fiction novel and cautionary tale about the future.',
    totalCopies: 4
  },
  {
    isbn: '978-0-452-28423-4',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    publisher: 'Charles Scribner\'s Sons',
    publishedYear: 1925,
    category: 'Classic Literature',
    description: 'A novel set in the Jazz Age on Long Island, exploring themes of decadence, idealism, and social upheaval.',
    totalCopies: 3
  },
  {
    isbn: '978-0-06-231500-7',
    title: 'The Hunger Games',
    author: 'Suzanne Collins',
    publisher: 'Scholastic Press',
    publishedYear: 2008,
    category: 'Young Adult',
    description: 'A dystopian novel about a televised competition in which teenagers fight to the death.',
    totalCopies: 5
  },
  {
    isbn: '978-0-316-76948-0',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    publisher: 'Little, Brown and Company',
    publishedYear: 1951,
    category: 'Classic Literature',
    description: 'A story about the events in the life of Holden Caulfield, a rebellious teenager.',
    totalCopies: 3
  },
  {
    isbn: '978-0-307-27778-0',
    title: 'The Da Vinci Code',
    author: 'Dan Brown',
    publisher: 'Doubleday',
    publishedYear: 2003,
    category: 'Mystery Thriller',
    description: 'A mystery thriller novel that follows symbologist Robert Langdon as he investigates a murder in the Louvre.',
    totalCopies: 4
  },
  {
    isbn: '978-0-679-72100-2',
    title: 'Harry Potter and the Sorcerer\'s Stone',
    author: 'J.K. Rowling',
    publisher: 'Bloomsbury',
    publishedYear: 1997,
    category: 'Fantasy',
    description: 'The first novel in the Harry Potter series, following a young wizard who discovers his magical heritage.',
    totalCopies: 6
  },
  {
    isbn: '978-0-14-028329-7',
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    author: 'J.R.R. Tolkien',
    publisher: 'George Allen & Unwin',
    publishedYear: 1954,
    category: 'Fantasy',
    description: 'The first volume of an epic high-fantasy novel about a quest to destroy a powerful ring.',
    totalCopies: 4
  },
  {
    isbn: '978-0-307-47427-8',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    publisher: 'HarperCollins',
    publishedYear: 1988,
    category: 'Fiction',
    description: 'A philosophical novel about a young Andalusian shepherd who travels to Egypt in search of treasure.',
    totalCopies: 3
  },
  {
    isbn: '978-0-316-01581-7',
    title: 'The Book Thief',
    author: 'Markus Zusak',
    publisher: 'Picador',
    publishedYear: 2005,
    category: 'Historical Fiction',
    description: 'A novel set during World War II in Germany, narrated by Death, about a young girl who steals books.',
    totalCopies: 4
  },
  {
    isbn: '978-0-14-027736-8',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    publisher: 'T. Egerton',
    publishedYear: 1813,
    category: 'Romance',
    description: 'A romantic novel that follows the emotional development of Elizabeth Bennet.',
    totalCopies: 3
  },
  {
    isbn: '978-0-451-52493-6',
    title: 'Brave New World',
    author: 'Aldous Huxley',
    publisher: 'Chatto & Windus',
    publishedYear: 1932,
    category: 'Dystopian Fiction',
    description: 'A dystopian novel that explores a futuristic society where citizens are genetically engineered.',
    totalCopies: 3
  },
  {
    isbn: '978-0-312-19554-5',
    title: 'The Kite Runner',
    author: 'Khaled Hosseini',
    publisher: 'Riverhead Books',
    publishedYear: 2003,
    category: 'Historical Fiction',
    description: 'A story about friendship, betrayal, and redemption set in Afghanistan.',
    totalCopies: 4
  },
  {
    isbn: '978-0-316-01692-0',
    title: 'Life of Pi',
    author: 'Yann Martel',
    publisher: 'Knopf Canada',
    publishedYear: 2001,
    category: 'Adventure',
    description: 'A philosophical novel about a young man who survives a shipwreck and shares a lifeboat with a Bengal tiger.',
    totalCopies: 3
  },
  {
    isbn: '978-0-679-41003-6',
    title: 'The Road',
    author: 'Cormac McCarthy',
    publisher: 'Alfred A. Knopf',
    publishedYear: 2006,
    category: 'Post-Apocalyptic',
    description: 'A novel about a father and son journeying through a post-apocalyptic landscape.',
    totalCopies: 3
  },
  {
    isbn: '978-0-307-27777-3',
    title: 'The Girl with the Dragon Tattoo',
    author: 'Stieg Larsson',
    publisher: 'Norstedts Förlag',
    publishedYear: 2005,
    category: 'Mystery Thriller',
    description: 'A crime novel about a journalist and a hacker investigating a disappearance.',
    totalCopies: 4
  },
  {
    isbn: '978-0-345-39180-3',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    publisher: 'George Allen & Unwin',
    publishedYear: 1937,
    category: 'Fantasy',
    description: 'A fantasy novel about a hobbit who embarks on an unexpected journey.',
    totalCopies: 5
  },
  {
    isbn: '978-0-553-38011-7',
    title: 'The Shining',
    author: 'Stephen King',
    publisher: 'Doubleday',
    publishedYear: 1977,
    category: 'Horror',
    description: 'A horror novel about a family caretaking an isolated hotel during winter.',
    totalCopies: 3
  },
  {
    isbn: '978-0-670-81302-4',
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    publisher: 'DAW Books',
    publishedYear: 2007,
    category: 'Fantasy',
    description: 'The first book in the Kingkiller Chronicle, telling the story of a legendary figure.',
    totalCopies: 3
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
