import { create } from "zustand";

export const useChatStore = create((set) => ({
  username: "",
  messages: [],
  setUsername: (name) => set({ username: name }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
}));
