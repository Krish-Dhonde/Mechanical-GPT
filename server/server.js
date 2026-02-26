import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import chatRoutes from "./routes/chatRoutes.js";
connectDB();

const app = express();

const allowedOrigins = ["https://mechanical-gpt-frontend.vercel.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, server-to-server)
      if (!origin) return callback(null, true);

      // Allow main production URL
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel preview deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Handle preflight explicitly
app.options("*", cors());

app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Mechanical GPT Backend Running 🚀" });
});

app.use("/api", chatRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
