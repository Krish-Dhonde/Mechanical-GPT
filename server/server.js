import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import chatRoutes from "./routes/chatRoutes.js";
connectDB();

const app = express();

app.use(cors({
  origin: "https://mechanical-gpt-backend.onrender.com",
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));

app.use("/api", chatRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
