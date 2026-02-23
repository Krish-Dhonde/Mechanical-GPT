import { create } from "zustand";

export const useChatStore = create((set) => ({
  operationType: "",
  subOperation: "",
  inputs: {},
  messages: [],
  result: null,
  loading: false,

  setOperationType: (value) => set({ operationType: value }),
  setSubOperation: (value) => set({ subOperation: value }),
  setInputs: (inputs) => set({ inputs }),

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  setResult: (result) => set({ result }),

  setLoading: (value) => set({ loading: value }),
}));