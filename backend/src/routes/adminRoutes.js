
const express = require("express");

const { getAllTickets, updateTicket, addAdminReply, addInternalNote, generateReplyDraft } = require("../controllers/adminController");

const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware, authorizeRoles("ADMIN"));

router.get("/tickets", getAllTickets);
router.patch("/tickets/:id", updateTicket);
router.post("/tickets/:id/messages", addAdminReply);
router.post("/tickets/:id/internal-notes", addInternalNote);
router.post("/tickets/:id/ai-draft", generateReplyDraft);

module.exports = router;
