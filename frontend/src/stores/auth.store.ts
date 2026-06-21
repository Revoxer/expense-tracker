import { create } from "zustand";
import { getToken, setToken, removeToken } from "../utils/storage";

interface User {
  id: string;
  email: string;
  createdAt: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getToken(),
  user: null,
  setAuth: (token, user) => {
    setToken(token);
    set({ token, user });
  },
  clearAuth: () => {
    removeToken();
    set({ token: null, user: null });
  },
}));
