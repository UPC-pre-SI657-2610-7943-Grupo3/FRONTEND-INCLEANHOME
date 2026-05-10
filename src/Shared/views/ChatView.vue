<template>
  <div class="flex flex-col chat-container">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-4">
      <button @click="$router.back()" class="btn btn-secondary btn-sm">←</button>
      <div class="conv-avatar" :style="{ background: getColor(Number(route.params.userId)) }">
        <span class="conv-initial">{{ otherName[0] || '?' }}</span>
      </div>
      <span class="chat-title">{{ otherName }}</span>
    </div>

    <!-- Messages -->
    <div ref="msgContainer" class="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 messages-list">
      <div v-if="loading" class="flex justify-center py-8"><div class="spinner"></div></div>
      <div v-else-if="!messages.length" class="text-center py-8 empty-text">Sé el primero en escribir</div>
      <div v-for="msg in messages" :key="msg.id"
        :class="['msg-wrap', msg.senderId === auth.user?.id ? 'msg-mine' : 'msg-theirs']">
        <div :class="['msg-bubble', msg.senderId === auth.user?.id ? 'bubble-mine' : 'bubble-theirs']">
          {{ msg.content }}
        </div>
        <span class="msg-time">{{ formatTime(msg.createdAt) }}</span>
      </div>
    </div>

    <!-- Input -->
    <div class="flex items-center gap-3 mt-3 pt-3 chat-input">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        class="input-field flex-1"
        :placeholder="t('messages.typeMessage')" />
      <button @click="sendMessage" class="btn btn-primary" :disabled="!newMessage.trim()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../stores/auth.js";
import api from "../api.js";

const { t } = useI18n();
const route = useRoute();
const auth = useAuthStore();
const messages = ref([]);
const loading = ref(true);
const newMessage = ref("");
const msgContainer = ref(null);
const otherName = ref("...");

const colors = ["#2563eb","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444"];
function getColor(id) { return colors[id % colors.length]; }
function formatTime(d) { if (!d) return ""; return new Date(d).toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"}); }

async function sendMessage() {
  if (!newMessage.value.trim()) return;
  const content = newMessage.value;
  newMessage.value = "";
  await api.post(`/messages/${route.params.userId}`, { content });
  await load();
}

async function scrollBottom() {
  await nextTick();
  if (msgContainer.value) msgContainer.value.scrollTop = msgContainer.value.scrollHeight;
}

async function load() {
  const { data } = await api.get(`/messages/${route.params.userId}`);
  messages.value = data;
  if (data.length && data[0].senderId !== auth.user?.id) {
    // try to get name from conversation
  }
  await scrollBottom();
}

onMounted(async () => {
  // Try to get other user's name from conversations
  try {
    const { data } = await api.get("/messages/conversations");
    const conv = data.find(c => String(c.userId) === String(route.params.userId));
    if (conv) otherName.value = conv.userName;
  } catch {}
  try { await load(); } catch {} finally { loading.value = false; }
});
</script>

<style scoped>
.conv-avatar { width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.msg-wrap { display:flex;flex-direction:column;max-width:70%; }
.msg-mine { align-self:flex-end;align-items:flex-end; }
.msg-theirs { align-self:flex-start;align-items:flex-start; }
.msg-bubble { padding:0.625rem 0.875rem;border-radius:1rem;font-size:0.9375rem;line-height:1.4;word-break:break-word; }
.bubble-mine { background:#2563eb;color:white;border-bottom-right-radius:4px; }
.bubble-theirs { background:white;color:#1e293b;border:1px solid #e2e8f0;border-bottom-left-radius:4px; }
.msg-time { font-size:0.6875rem;color:#94a3b8;margin-top:2px; }
.chat-container { height: calc(100vh - 120px); }
.conv-initial { color:white; font-weight:700; }
.chat-title { font-weight:700; font-size:1.0625rem; color:#1e293b; }
.messages-list { padding-bottom:0.5rem; }
.empty-text { color:#94a3b8; font-size:0.875rem; }
.chat-input { border-top:1px solid #e2e8f0; }
</style>
