
const mongoose = require("mongoose");
const Book = require("../models/Book");

const createBook = async (req, res, next) => {
  try {
    const { title, isbn } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Book title is required",
      });
    }

    const book = await Book.create({
      title: title.trim(),
      isbn: isbn?.trim() || undefined,
      author: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Book created successfully",
      book,
    });
  } catch (error) {
    next(error);
  }
};

const getMyBooks = async (req, res, next) => {
  try {
    const books = await Book.find({
      author: req.user.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    const book = await Book.findOne({
      _id: id,
      author: req.user.userId,
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    return res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBook,
  getMyBooks,
  getBookById,
};
