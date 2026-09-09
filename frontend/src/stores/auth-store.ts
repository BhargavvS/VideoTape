import { create } from "zustand";
import { api, normalize } from "@/lib/api-client";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  ready: boolean;
  setUser: (u: User | null) => void;
  fetchMe: () => Promise<void>;
  login: (input: { username?: string; email?: string; password: string }) => Promise<void>;
  register: (fd: FormData) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  ready: false,
  setUser: (user) => set({ user }),
  fetchMe: async () => {
    try {
      const { data } = await api.get("/users/current-user");
      set({ user: normalize<User>(data), ready: true });
    } catch {
      set({ user: null, ready: true });
    }
  },
  login: async (input) => {
    const { data } = await api.post("/users/login", input);
    const payload = normalize<{ user: User; accessToken: string }>(data);
    if (payload?.accessToken) localStorage.setItem("accessToken", payload.accessToken);
    if (payload?.user) set({ user: payload.user });
    else await useAuth.getState().fetchMe();
  },
  register: async (fd) => {
    await api.post("/users/register", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  logout: async () => {
    try {
      await api.post("/users/logout");
    } finally {
      localStorage.removeItem("accessToken");
      set({ user: null });
    }
  },
}));
