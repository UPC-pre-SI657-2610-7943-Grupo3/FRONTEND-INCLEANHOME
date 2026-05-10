import { defineStore } from "pinia";
import { ref } from "vue";

export const useToastStore = defineStore("toast", () => {
  const visible = ref(false);
  const message = ref("");
  const type = ref("success");
  let timer = null;

  function show(msg, t = "success") {
    message.value = msg;
    type.value = t;
    visible.value = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { visible.value = false; }, 3000);
  }

  function success(msg) { show(msg, "success"); }
  function error(msg) { show(msg, "error"); }

  return { visible, message, type, success, error };
});
