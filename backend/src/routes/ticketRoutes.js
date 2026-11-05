
const express = require("express");

const { createTicket, getMyTickets, getTicketById, addAuthorReply } = require("../controllers/ticketController");

const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createTicket);
router.get("/my-tickets", getMyTickets);
router.get("/:id", getTicketById);
router.post("/:id/messages", authorizeRoles("AUTHOR"), addAuthorReply);

module.exports = router;
