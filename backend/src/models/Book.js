
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    isbn: {
      type: String,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        "SUBMITTED",
        "IN_PRODUCTION",
        "PUBLISHED",
        "ON_HOLD",
      ],
      default: "SUBMITTED",
    },
    totalRoyalties: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingRoyalties: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);