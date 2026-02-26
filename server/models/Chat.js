import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    content: { type: String },
    image: { type: String },
  },
  { _id: false },
);

const chatSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    operationType: { type: String },
    subOperation: { type: String },
    messages: [messageSchema],
    // Persist the last computed result so it can be restored when the chat is reopened
    lastResult: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("Chat", chatSchema);
