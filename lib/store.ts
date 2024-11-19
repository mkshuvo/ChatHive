import { create } from 'zustand';
import { Message } from '@/server/types/chat';

interface ChatState {
  messages: Message[];
  activeChat: string | null;
  addMessage: (message: Message) => void;
  setActiveChat: (userId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  activeChat: null,
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setActiveChat: (userId) =>
    set(() => ({
      activeChat: userId,
    })),
}));