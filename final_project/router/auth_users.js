const express = require("express");
const jwt = require("jsonwebtoken");

const regd_users = express.Router();

const books = require("./booksdb.js");

const users = [];

const activeUser = {};

const isValid = (username) => {
  //write code to check is the username is valid
  return users.every((user) => user.username !== username);
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

const alreadyLoggedIn = (username) => {
  return activeUser.username === username;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      message:
        "You must provide a valid password and username in order to login.",
    });
  }

  if (authenticatedUser(username, password)) {
    if (!alreadyLoggedIn(username)) {
      const accessToken = jwt.sign(
        {
          data: password,
        },
        "access",
        { expiresIn: 60 * 60 }
      );
      req.session.authorization = { accessToken, username };
      activeUser.username = username;

      return res.status(200).json({ message: "User successfully logged in." });
    }
    return res.status(208).json({ message: "User already logged in." });
  }
  return res.status(208).json({ message: "Invalid login credentials." });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const requestedBook = books[isbn];

  if (requestedBook) {
    const username = req.session.authorization.username;
    const description = req.query.description;
    const newReview = { [username]: description };
    requestedBook.reviews = { ...requestedBook.reviews, ...newReview };

    return res.status(200).json({ [isbn]: requestedBook });
  }
  return res.status(404).json({ message: `Invalid ISBN code: "${isbn}".` });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const requestedBook = books[isbn];
  const username = req.session.authorization.username;

  if (requestedBook) {
    const currentUserReview = requestedBook.reviews[username];

    if (currentUserReview) {
      delete books[isbn].reviews[username];

      return res.status(200).json({
        message: `Review of the book ${requestedBook.title} deleted successfully.`,
      });
    }
    return res.status(404).json({
      message: `No reviews to the book with ISBN code: "${JSON.stringify(
        isbn
      )}".`,
    });
  }
  return res
    .status(404)
    .json({ message: `No books with ISBN code: "${JSON.stringify(isbn)}".` });
});

module.exports.authenticated = regd_users;
module.exports.users = users;
module.exports.isValid = isValid;
