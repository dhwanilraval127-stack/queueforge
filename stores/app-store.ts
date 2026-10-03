'use client';
import { create } from 'zustand';

interface ToastEntry {
  id: string;
  message: string;
  variant: 'info' | 'success' | 'error';
}

interface AppStore {
  toasts: ToastEntry[];
  pushToast: (toast: Omit<ToastEntry, 'id'>) => void;
  dismissToast: (id: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  toasts: [],
  pushToast: (toast) => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({ toasts: [...state.toasts, { id, ...toast }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));