import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IUser } from "../types/auth.types";

interface AuthState {
    user: IUser | null;
    isLoggedIn: boolean;
    // Actions
    setAuth: (user: IUser) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isLoggedIn: false,

            setAuth: (user) => {
                set({ user, isLoggedIn: true,  });
            },

            clearAuth: () => {
                set({ user: null, isLoggedIn: false });
            },
        }),
        {
            name: "covid19-auth", 
        }
    )
);