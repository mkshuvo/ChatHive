import { create } from 'zustand';

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: User;
  receiver: User;
}

interface ChatState {
  messages: Message[];
  activeChat: string | null;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setActiveChat: (userId: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  activeChat: null,
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setMessages: (messages) =>
    set(() => ({
      messages,
    })),
  setActiveChat: (userId) =>
    set(() => ({
      activeChat: userId,
    })),
  clearMessages: () =>
    set(() => ({
      messages: [],
    })),
}));