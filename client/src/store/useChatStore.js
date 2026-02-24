import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import api from "../api/axios";

export const useChatStore = create((set, get) => ({
  sessionId: uuidv4(),
  operationType: "",
  subOperation: "",
  inputs: {},
  messages: [],
  result: null,
  loading: false,
  chats: [],

  setOperationType: (value) => set({ operationType: value }),
  setSubOperation: (value) => set({ subOperation: value }),
  setInputs: (inputs) => set({ inputs }),

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),

  setResult: (result) => set({ result }),
  setLoading: (value) => set({ loading: value }),

  fetchChats: async () => {
    try {
      const res = await api.get("/chats");
      set({ chats: res.data });
    } catch (err) {
      console.error("fetchChats error:", err);
    }
  },

  loadChat: async (sessionId) => {
    set({ loading: true });
    try {
      const res = await api.get(`/chats/${sessionId}`);
      const chat = res.data;
      set({
        sessionId: chat.sessionId,
        operationType: chat.operationType || "",
        subOperation: chat.subOperation || "",
        messages: chat.messages || [],
        loading: false,
        result: null, // Results are usually re-calculated or could be stored, for now we clear or reload
      });
    } catch (err) {
      console.error("loadChat error:", err);
      set({ loading: false });
    }
  },

  createNewChat: () => {
    set({
      sessionId: uuidv4(),
      operationType: "",
      subOperation: "",
      inputs: {},
      messages: [],
      result: null,
    });
  },

  handleDeleteChat: async (sessionId) => {
    try {
      await api.delete(`/chats/${sessionId}`);
      const currentSessionId = get().sessionId;
      if (currentSessionId === sessionId) {
        get().createNewChat();
      }
      get().fetchChats();
    } catch (err) {
      console.error("deleteChat error:", err);
    }
  },
}));
