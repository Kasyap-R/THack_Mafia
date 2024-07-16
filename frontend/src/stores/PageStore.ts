import {create} from 'zustand';

export enum Page {
    LOGIN,
    MEETING,
}

interface PageState {
    currentPage: Page
    setPage: (page: Page) => void;
}

export const usePageStore = create<PageState>((set) => ({
    currentPage: Page.MEETING,
    setPage: (page: Page) => set({currentPage: page}),
}));