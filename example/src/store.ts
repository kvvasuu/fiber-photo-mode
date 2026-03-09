import { create } from "zustand";
import type { Format, Output } from "./components/photo-mode-panel/tabs/OutputTab";

export type Store = {
  isDay: boolean;

  toggleDay: () => void;

  width: number;
  height: number;
  quality: number;
  format: Format;
  output: Output;
  overridePosition: boolean;
  overridePositionVec: string;
};

export const useMainStore = create<Store>((set) => ({
  isDay: true,
  toggleDay: () => {
    set((state) => ({
      isDay: !state.isDay,
    }));
  },

  width: 1920,
  height: 1080,
  quality: 0.95,
  format: "jpeg",
  output: "New Tab",
  overridePosition: false,
  overridePositionVec: "Pos 1",
}));
