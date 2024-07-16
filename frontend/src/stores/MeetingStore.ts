import { create } from 'zustand';

export interface User {
    name: string,
}

export interface Chat {
    user: string,
    message: string,
}

interface MeetingState {
    users: User[],
    images: any[],
    chatHistory: Chat[],
    updateChatHistory: (chat: Chat) => void;
}

export const useMeetingStore = create<MeetingState>((set) => ({
    users: [],
    images: [],
    chatHistory: [],
    updateChatHistory: (chat: Chat) => set((state) => ({
        chatHistory: [...state.chatHistory, chat]
    })),
}));
