import { create } from 'zustand';
import {User} from './UserStore'


export interface Chat {
    user: string,
    message: string,
}

export interface ScreenState {
    state: string,
}

interface MeetingState {
    users: User[],
    images: any[],
    chatHistory: Chat[],
    meetingList: string[]
    screenState: ScreenState[],
    updateChatHistory: (chat: Chat) => void;
    updateScreenState: (screenState: ScreenState) => void;
}

export const useMeetingStore = create<MeetingState>((set) => ({
    users: [],
    images: [],
    chatHistory: [],
    meetingList: [],
    screenState: [],
    updateChatHistory: (chat: Chat) => set((state) => ({
        chatHistory: [...state.chatHistory, chat]
    })),
    updateScreenState: (screenState: ScreenState)  => set((state) => ({
        screenState: [...state.screenState, screenState]
    })),
}));
