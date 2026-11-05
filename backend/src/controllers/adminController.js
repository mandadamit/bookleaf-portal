
const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");
const { generateTicketReply } = require("../services/aiService");

const getAllTickets = async (req, res, next) => {
  try {
    const {
      status,
      category,
      priority,
      from,
      to,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    if (from || to) {
      filter.createdAt = {};

      if (from) {
        const startDate = new Date(from);
        if (Number.isNaN(startDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid from date",
          });
        }
        filter.createdAt.$gte = startDate;
      }

      if (to) {
        const endDate = new Date(to);
        if (Number.isNaN(endDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid to date",
          });
        }
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));

    const [tickets, total, statusCountsResult] = await Promise.all([
      Ticket.find(filter)
        .populate("author", "name email")
        .populate("book", "title isbn")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize),

      Ticket.countDocuments(filter),

      Ticket.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const statusCounts = {
      OPEN: 0,
      IN_PROGRESS: 0,
      WAITING_FOR_AUTHOR: 0,
      RESOLVED: 0,
      CLOSED: 0,
    };

    statusCountsResult.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    return res.status(200).json({
        success: true,
        total,
        page: currentPage,
        pages: Math.ceil(total / pageSize),
        statusCounts,
        tickets,
      });
  } catch (error) {
    next(error);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const { status, category, priority, assignedTo } = req.body;
    const updates = {};

    if (status !== undefined) {
      if (!["OPEN", "IN_PROGRESS", "WAITING_FOR_AUTHOR", "RESOLVED", "CLOSED"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket status",
        });
      }
      updates.status = status;
    }

    if (category !== undefined) {
      if (![
        "ROYALTY_PAYMENTS",
        "ISBN_METADATA",
        "PRINTING_QUALITY",
        "DISTRIBUTION_AVAILABILITY",
        "BOOK_STATUS",
        "GENERAL_INQUIRY",
        "ACCOUNT",
      ].includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket category",
        });
      }
      updates.category = category;
    }

    if (priority !== undefined) {
      if (!["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket priority",
        });
      }
      updates.priority = priority;
    }

    if (assignedTo !== undefined) {
      if (assignedTo === null || assignedTo === "") {
        updates.assignedTo = null;
      } else if (mongoose.isValidObjectId(assignedTo)) {
        const User = require("../models/User");
        const agent = await User.findOne({
          _id: assignedTo,
          role: "ADMIN",
          isActive: true,
        });

        if (!agent) {
          return res.status(400).json({
            success: false,
            message: "Active admin assignee not found",
          });
        }

        updates.assignedTo = agent._id;
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid assignee ID",
        });
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one valid field to update",
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("author", "name email")
      .populate("assignedTo", "name email");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

const addAdminReply = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }

    const ticket = await Ticket.findById(req.params.id);

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
      message: "Admin reply added successfully",
      data: updatedTicket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addInternalNote = async (req, res) => {
  try {
    const { message } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Internal note is required",
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    ticket.messages.push({
      sender: req.user.userId,
      message: message.trim(),
      isInternal: true,
    });

    await ticket.save();

    return res.status(201).json({
      success: true,
      message: "Internal note added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add internal note",
    });
  }
};

const generateReplyDraft = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("messages.sender", "name role");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const draft = await generateTicketReply({
      subject: ticket.subject,
      description: ticket.description,
      messages: ticket.messages,
    });

    if (!draft) {
      return res.status(503).json({
        success: false,
        message: "AI service unavailable. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "AI reply draft generated successfully",
      data: {
        draft,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate AI reply draft",
    });
  }
};

module.exports = { getAllTickets, updateTicket, addAdminReply, addInternalNote, generateReplyDraft };
