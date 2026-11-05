
const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");
const Book = require("../models/Book");
const { classifyTicket } = require("../services/aiService");

const createTicket = async (req, res, next) => {
    try {
        const { subject, description, bookId, category } = req.body;

    if (!subject?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject and description are required",
      });
    }

    let book = null;

    if (bookId) {
      if (!mongoose.isValidObjectId(bookId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid book ID",
        });
      }

      book = await Book.findOne({
        _id: bookId,
        author: req.user.userId,
      });

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }
    }

    const allowedCategories = [
      "ROYALTY_PAYMENTS",
      "ISBN_METADATA",
      "PRINTING_QUALITY",
      "DISTRIBUTION_AVAILABILITY",
      "BOOK_STATUS",
      "GENERAL_INQUIRY",
      "ACCOUNT",
    ];

    if (category && !allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket category",
      });
    }
    const aiResult = await classifyTicket({subject: subject.trim(), description: description.trim() });
    
    const ticket = await Ticket.create({
        author: req.user.userId,
        book: book?._id || null,
        subject: subject.trim(),
        description: description.trim(),
        category: aiResult?.category || category || "GENERAL_INQUIRY",
        priority: aiResult?.priority || "MEDIUM",
        ticketNumber: `BL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,

        aiClassification: aiResult
        ? {
            category: aiResult.category,
            priority: aiResult.priority,
            confidence: aiResult.confidence,
            suggestedResponse: aiResult.suggestedResponse,
        }
        : undefined,
    });

    return res.status(201).json({
        success: true,
        message: "Ticket created successfully",
        ticket,
    });
    } catch (error) {
        next(error);
    }
};

const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({
      author: req.user.userId,
    })
      .populate("book", "title isbn")
      .sort({ createdAt: -1 });
    tickets.forEach((ticket) => {
      ticket.messages = ticket.messages.filter(
        (message) => !message.isInternal
      );
    });
    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    next(error);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const ticket = await Ticket.findOne({
      _id: id,
      author: req.user.userId,
    }).populate("book", "title isbn");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    ticket.messages = ticket.messages.filter(
        (message) => !message.isInternal
      );
    
    return res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

const addAuthorReply = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }

    const ticket = await Ticket.findOne({
      _id: req.params.id,
      author: req.user.userId,
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    ticket.messages.push({
      sender: req.user.userId,
      message: message.trim(),
      isInternal: false,
    });

    await ticket.save();
    const io = req.app.get("io");

    io.to(`ticket:${ticket._id}`).emit("ticket:new-message", {
      ticketId: ticket._id,
      message: {
        sender: req.user.userId,
        message: message.trim(),
        isInternal: false,
        createdAt: new Date(),
      },
    });

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("author", "name email")
      .populate("messages.sender", "name role");

    return res.status(201).json({
      success: true,
      message: "Reply added successfully",
      data: updatedTicket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getTicketById,
  addAuthorReply
};
