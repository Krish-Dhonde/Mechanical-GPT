import express from "express";
import {
  handleChat,
  getChats,
  getChatBySession,
  deleteChat,
} from "../controllers/chatController.js";
import { mechanicalGuard } from "../middleware/mechanicalGuard.js";

const router = express.Router();

router.post("/chat", mechanicalGuard, handleChat);
router.get("/chats", getChats);
router.get("/chats/:sessionId", getChatBySession);
router.delete("/chats/:sessionId", deleteChat);

export default router;
