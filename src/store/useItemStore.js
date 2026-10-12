import { create } from "zustand";
import { api } from "../api/api";

export const useItemStore = create((set) => ({
    items: [],
    getItems: async () => {
        try {
            const res = await api.getItems()
            set({ messages: res.data })
        } catch (error) {
            console.error(error)
        }
    }
}))