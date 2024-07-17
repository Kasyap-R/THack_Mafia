import {create} from 'zustand';

export enum Page {
    LOGIN,
    MEETING,
    HOME,
}

interface PageState {
    currentPage: Page
    setPage: (page: Page) => void;
}

export const usePageStore = create<PageState>((set) => ({
    currentPage: Page.HOME,
    setPage: (page: Page) => set({currentPage: page}),
}));