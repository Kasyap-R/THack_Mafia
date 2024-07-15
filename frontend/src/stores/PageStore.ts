import {create} from 'zustand';

export enum Page {
    HOME,
    LOGIN,
}

interface PageState {
    currentPage: Page
    setPage: (page: Page) => void;
}

export const usePageStore = create<PageState>((set) => ({
    currentPage: Page.LOGIN,
    setPage: (page: Page) => set({currentPage: page}),
}));