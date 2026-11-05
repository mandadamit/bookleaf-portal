
const express = require("express");

const {
  createBook,
  getMyBooks,
  getBookById,
} = require("../controllers/bookController");

const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createBook);
router.get("/my-books", getMyBooks);
router.get("/:id", getBookById);

module.exports = router;
