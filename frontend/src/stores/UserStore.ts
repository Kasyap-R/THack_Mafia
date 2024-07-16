import {create} from 'zustand'

interface UserState {
    user_id: number,
    username: string | null,
    setUserId: (id: number) => void,
    setRealUsername: (name: string) => void,
}

export const useUserStore = create<UserState>((set) => ({
    user_id: 1,
    username: null,
    setUserId: (id: number) => set({user_id: id}),
    setRealUsername: (name: string) => set({username: name})
}));
