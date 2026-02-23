import express from "express";
import { handleChat } from "../controllers/chatController.js";
import { mechanicalGuard } from "../middleware/mechanicalGuard.js";

const router = express.Router();

router.post("/chat", mechanicalGuard, handleChat);

export default router;