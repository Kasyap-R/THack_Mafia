import {create} from 'zustand'

export interface User {
    name: string,
    id: number,
}

interface UserState {
    user: User
    setUser: (user: User) => void,
}

export const useUserStore = create<UserState>((set) => ({
    user: {name: "H", id: 1},
    setUser: (user: User) => set({user: user}),
}));
