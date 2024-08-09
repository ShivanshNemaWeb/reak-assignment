const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { stringify } = require('csv-stringify/sync');

// Function to read books from a CSV file
const readBooksFromFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const books = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row['BookName'] && row['Author'] && row['PublicationYear']) {
          books.push({
            BookName: row['BookName'],
            Author: row['Author'],
            PublicationYear: row['PublicationYear']
          });
        }
      })
      .on('end', () => resolve(books))
      .on('error', reject);
  });
};

// Function to write books to a CSV file
const writeBooksToFile = (filePath, books) => {
  const header = [
    { 'BookName': 'BookName', 'Author': 'Author', 'PublicationYear': 'PublicationYear' }
  ];
  const csvData = stringify([...header, ...books], { header: false });
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, csvData, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// Endpoint to get the list of books
exports.home = async (req, res) => {
  const user = req.user; // Get user info from request object
  const filePaths = [path.join(__dirname, '../data/regularUser.csv')];
  
  if (user.role === 'admin') {
    filePaths.push(path.join(__dirname, '../data/adminUser.csv'));
  }

  try {
    const bookPromises = filePaths.map(readBooksFromFile);
    const booksArray = await Promise.all(bookPromises);
    
    // remove duplicate records
    const allBooks = booksArray.flat();
    const uniqueBooks = Array.from(new Map(allBooks.map(book => [JSON.stringify(book), book])).values());

    res.json({ books: uniqueBooks });
  } catch (err) {
    res.status(500).json({ message: 'Error reading books' });
  }
};

// Endpoint to add a new book
exports.addBook = (req, res) => {
  const { bookName, author, publicationYear } = req.body;

  if (typeof bookName !== 'string' || typeof author !== 'string' || isNaN(publicationYear) || publicationYear < 1000 || publicationYear > new Date().getFullYear()) {
    return res.status(400).json({ message: 'Invalid parameters' });
  }

  const filePath = path.join(__dirname, '../data/regularUser.csv');
  const newBook = `${bookName},${author},${publicationYear}\n`;

  fs.appendFile(filePath, newBook, (err) => {
    if (err) return res.status(500).json({ message: 'Error adding book' });
    res.json({ message: 'Book added successfully' });
  });
};

// Endpoint to delete a book
exports.deleteBook = async (req, res) => {
  const { bookName } = req.body;
  
  if (typeof bookName !== 'string') {
    return res.status(400).json({ message: 'Invalid parameters' });
  }

  const filePath = path.join(__dirname, '../data/regularUser.csv');

  try {
    // Read existing books
    const books = await readBooksFromFile(filePath);
    
    // Filter out the book to be deleted
    const updatedBooks = books.filter(book => 
      book.BookName.toLowerCase() !== bookName.toLowerCase()
    );

    if (updatedBooks.length === books.length) {
      // No book was deleted
      return res.status(404).json({ message: 'Book not found' });
    }

    // Write updated books back to file, preserving headers
    await writeBooksToFile(filePath, updatedBooks);

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.log('Error:', err);
    res.status(500).json({ message: 'Error deleting book' });
  }
};