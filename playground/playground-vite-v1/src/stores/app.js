import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    isUniversalRendered: true,
    renderTime: null,
  }),
});
