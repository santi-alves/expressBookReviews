const express = require("express");
const axios = require("axios").default;

const books = require("./booksdb.js");
const users = require("./auth_users.js").users;
const isValid = require("./auth_users.js").isValid;

const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login." });
    }
    return res
      .status(400)
      .json({ message: "That username already exists; try a different one." });
  }
  return res
    .status(400)
    .json({ message: "You must provide a valid username and password" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).json(books);
});

//Axios get request: books list using promise/callbacks syntax
const getBooksList = () => {
  axios
    .get("http://localhost:5000/")
    .then((res) => console.log("@@@ res.data :>> \n", res.data))
    .catch((err) => console.log("@@@ err :>> \n", err))
    .finally(() => console.log("@@@ done."));
};
//getBooksList();

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const requestedBook = books[isbn];

  if (requestedBook) {
    return res.status(200).json({ [isbn]: requestedBook });
  }
  return res.status(404).send(`No book with ISBN: "${isbn}".`);
});

//Axios get request: book by ISBN using async/await syntax
const getBookByISBN = async (isbn) => {
  try {
    const res = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    console.log("@@@ res.data :>> \n", res.data);
  } catch (err) {
    console.log("@@@ err :>> \n", err);
  } finally {
    console.log("@@@ done.");
  }
};
//getBookByISBN(5);

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const bookCatalogue = Object.values(books);
  const requestedBooks = bookCatalogue.filter((book) => book.author === author);

  if (requestedBooks.length > 0) {
    return res.status(200).json(requestedBooks);
  }
  return res.status(404).send(`No books by the author: "${author}".`);
});

//Axios get request: books by author
const getBooksByAuthor = (author) => {
  axios
    .get(`http://localhost:5000/author/${author}`)
    .then((res) => console.log("@@@ res.data :>> \n", res.data))
    .catch((err) => console.log("@@@ err :>> \n", err))
    .finally(() => console.log("@@@ done"));
};
//getBooksByAuthor("Dante Alighieri");

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const bookCatalogue = Object.values(books);
  const requestedBooks = bookCatalogue.filter((book) => book.title === title);

  if (requestedBooks.length > 0) {
    return res.status(200).json(requestedBooks);
  }
  return res.status(404).send(`No books with the title: "${title}".`);
});

// Axios get request: book by title
const getBookByTitle = async (title) => {
  try {
    const res = await axios.get(`http://localhost:5000/title/${title}`);
    console.log("@@@ res.data :>> \n", res.data);
  } catch (err) {
    console.log("@@@ err :>> \n", err);
  } finally {
    console.log("@@@ done.");
  }
};
//getBookByTitle("Fairy tales");

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const requestedBook = books[isbn];

  if (requestedBook) {
    if (requestedBook.reviews) {
      return res
        .status(200)
        .send(
          `Book "${isbn}" reviews: \n${JSON.stringify(requestedBook.reviews)}`
        );
    }
  }
  return res.status(404).send(`No book reviews with isbn: "${isbn}".`);
});

module.exports.general = public_users;
