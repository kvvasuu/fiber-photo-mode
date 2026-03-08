import { create } from "zustand";

export type Store = {
  isDay: boolean;

  toggleDay: () => void;
};

export const useMainStore = create<Store>((set) => ({
  isDay: true,
  toggleDay: () => {
    set((state) => ({
      isDay: !state.isDay,
    }));
  },
}));
