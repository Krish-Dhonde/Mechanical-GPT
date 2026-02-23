import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, required: true },
  content: { type: String },
  image: { type: String }
}, { _id: false });

const chatSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  operationType: { type: String },
  subOperation: { type: String },
  messages: [messageSchema]
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);