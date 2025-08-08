import { createStore } from "vuex";

export default createStore({
  state: {
    navIndex: 1,
    userData: sessionStorage.getItem("userData") ? JSON.parse(sessionStorage.getItem("userData")) : null,
  },
  getters: {},
  mutations: {
    setNavIndex(state, data) {
      state.navIndex = data;
    },
    setUserData(state, data) {
      sessionStorage.setItem("userData", JSON.stringify(data));
      state.userData = data;
    },
  },
  actions: {},
  modules: {},
});
