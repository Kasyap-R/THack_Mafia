import {create} from 'zustand';

export enum Page {
    HOME,
}

interface PageState {
    currentPage: Page
    setPage: (page: Page) => void;
}

const usePageStore = create<PageState>((set) => ({
    currentPage: Page.HOME,
    setPage: (page: Page) => set({currentPage: page}),
}));

export default usePageStore;
