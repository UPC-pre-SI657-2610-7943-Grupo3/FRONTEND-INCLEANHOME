import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../api.js";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(JSON.parse(localStorage.getItem("inclean_user") || "null"));
  const token = ref(localStorage.getItem("inclean_token") || null);

  const isLoggedIn = computed(() => !!token.value && !!user.value);

  function setAuth(userData, tokenData) {
    user.value = userData;
    token.value = tokenData;
    localStorage.setItem("inclean_user", JSON.stringify(userData));
    localStorage.setItem("inclean_token", tokenData);
    api.defaults.headers.common["Authorization"] = `Bearer ${tokenData}`;
  }

  function clearAuth() {
    user.value = null;
    token.value = null;
    localStorage.removeItem("inclean_user");
    localStorage.removeItem("inclean_token");
    delete api.defaults.headers.common["Authorization"];
  }

  // Restore token on load
  if (token.value) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
  }

  return { user, token, isLoggedIn, setAuth, clearAuth };
});
