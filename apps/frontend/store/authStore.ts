"use client";

import { create } from "zustand";
import axios from "axios";

interface User {
    id?: string;
    username: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;

    signup: (values: { username: string; email: string; password: string }) => Promise<void>;
    signin: (values: { username: string; password: string }) => Promise<void>;
    logout: () => void;
    setToken: (token: string | null) => void;
    fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
    loading: false,
    error: null,

    signup: async (values) => {
        try {
        set({ loading: true, error: null });
        const res = await axios.post("http://localhost:4000/api/v1/auth/signup", values);
        const token = res.data.token;
        localStorage.setItem("token", token);
        set({ token });
        await get().fetchUser();
        } catch (err: any) {
        set({ error: err.response?.data?.message || "Signup failed" });
        throw err;
        } finally {
        set({ loading: false });
        }
    },

    signin: async (values) => {
        try {
        set({ loading: true, error: null });
        const res = await axios.post("http://localhost:4000/api/v1/auth/signin", values);
        const token = res.data.token;
        localStorage.setItem("token", token);
        set({ token });
        await get().fetchUser();
        } catch (err: any) {
        set({ error: err.response?.data?.message || "Signin failed" });
        throw err;
        } finally {
        set({ loading: false });
        }
    },

    logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null });
    },

    setToken: (token) => {
        if (token) localStorage.setItem("token", token);
        else localStorage.removeItem("token");
        set({ token });
    },

    fetchUser: async () => {
        const token = get().token;
        if (!token) return;

        try {
        const res = await axios.get("http://localhost:4000/api/v1/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
        set({ user: res.data.user });
        } catch {
        set({ user: null, token: null });
        localStorage.removeItem("token");
        }
    },
}));
