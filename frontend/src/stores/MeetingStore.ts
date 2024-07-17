import { create } from 'zustand';
import {User} from './UserStore'
import {Meeting} from '../services/meetingService';


export interface Chat {
    user: string,
    message: string,
}

export interface ScreenState {
    state: any,
}

interface MeetingState {
    users: User[],
    images: any[],
    chatHistory: Chat[],
    meetingList: string[]
    screenState: ScreenState[],
    currentMeeting: Meeting | null,
    updateChatHistory: (chat: Chat) => void;
    updateScreenState: (screenState: ScreenState) => void;
    setCurrentMeeting: (meeting: Meeting) => void;
}

export const useMeetingStore = create<MeetingState>((set) => ({
    users: [],
    images: [],
    chatHistory: [],
    meetingList: [],
    screenState: [],
    currentMeeting: null,
    updateChatHistory: (chat: Chat) => set((state) => ({
        chatHistory: [...state.chatHistory, chat]
    })),
    updateScreenState: (screenState: ScreenState)  => set((state) => ({
        screenState: [...state.screenState, screenState]
    })),
    setCurrentMeeting: (meeting: Meeting) => set({currentMeeting: meeting}),
}));
