import { defineStore } from "pinia";

export const useWarningStore = defineStore("warning", {
  state: () => ({
    currentWarningType: null,
    isFromHomeClick: false,
  }),
  actions: {
    setWarningType(type) {
      this.currentWarningType = type;
    },
    setIsFromHomeClick(value) {
      this.isFromHomeClick = value;
    },
  },
});
