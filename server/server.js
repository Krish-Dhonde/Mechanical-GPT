import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import chatRoutes from "./routes/chatRoutes.js";
connectDB();
import { generateGeminiResponse } from "./services/geminiService.js";

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
// Accepts: production Vercel URL, all Vercel preview deployments, local dev
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/mechanical-gpt[a-z0-9\-]*\.vercel\.app$/,
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // server-to-server calls (Render health probes, curl, etc.)
  return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin not allowed — ${origin}`));
      }
    },
    credentials: true,
  }),
);

// ── BODY PARSER ───────────────────────────────────────────────────────────────
// 25mb to handle base64-encoded images (a 5MB img ≈ 7MB in base64 + JSON overhead)
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
// Render uses this to verify the service is up (prevents cold-start spin-down issues)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "Mechanical GPT Backend" });
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "Mechanical GPT Backend Running 🚀" });
});

app.get("/test-gemini", async (req, res) => {
  try {
    const reply = await generateGeminiResponse(
      "Explain briefly what drilling operation is in machining."
    );
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use("/api", chatRoutes);

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

// ── START ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
