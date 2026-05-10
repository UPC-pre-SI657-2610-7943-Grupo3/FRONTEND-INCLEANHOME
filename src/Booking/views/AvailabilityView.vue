<template>
  <div class="max-w-2xl">
    <h1 class="page-title mb-2">{{ t('nav.availability') }}</h1>
    <p class="page-subtitle mb-6">Configura los días y horarios en que puedes trabajar</p>

    <div class="card">
      <div class="flex flex-col gap-4">
        <div v-for="(day, index) in days" :key="index" class="day-row">
          <div class="flex items-center gap-3">
            <!-- Toggle -->
            <button @click="toggleDay(index)"
              :class="['toggle', slots[index]?.isAvailable ? 'toggle-on' : 'toggle-off']">
              <div :class="['toggle-knob', slots[index]?.isAvailable ? 'knob-on' : 'knob-off']"></div>
            </button>
            <span class="day-label">{{ day }}</span>
          </div>

          <div v-if="slots[index]?.isAvailable" class="flex items-center gap-2 flex-1">
            <select v-model="slots[index].startTime" class="input-field time-select">
              <option v-for="h in timeSlots" :key="h" :value="h">{{ h }}</option>
            </select>
            <span class="until-text">hasta</span>
            <select v-model="slots[index].endTime" class="input-field time-select">
              <option v-for="h in timeSlots" :key="h" :value="h">{{ h }}</option>
            </select>
          </div>
          <div v-else class="unavailable-text">No disponible</div>
        </div>
      </div>

      <div v-if="error" class="error-box">{{ error }}</div>

        <button @click="saveAvailability" class="btn btn-primary btn-full mt-6" :disabled="saving">
            <div v-if="saving" class="spinner spinner-sm"></div>
        {{ saving ? t('common.loading') : t('common.save') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../Shared/stores/auth.js";
import { useToastStore } from "../../Shared/stores/toast.js";
import api from "../../Shared/api.js";

const { t } = useI18n();
const auth = useAuthStore();
const toast = useToastStore();

const days = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const timeSlots = Array.from({ length: 17 }, (_, i) => `${String(i + 6).padStart(2,"0")}:00`);
const saving = ref(false);
const error = ref("");

const slots = ref(days.map((_, i) => ({
  dayOfWeek: i,
  startTime: "08:00",
  endTime: "18:00",
  isAvailable: i >= 1 && i <= 5,
})));

async function toggleDay(index) {
  slots.value[index].isAvailable = !slots.value[index].isAvailable;
}

async function saveAvailability() {
  saving.value = true;
  error.value = "";
  try {
    const workerId = auth.user?.id;
    await api.put(`/workers/${workerId}/availability`, { slots: slots.value });
    toast.success(t("common.success"));
  } catch (e) {
    error.value = e.response?.data?.error || t("common.error");
  } finally { saving.value = false; }
}

onMounted(async () => {
  try {
    const { data } = await api.get(`/workers/${auth.user?.id}/availability`);
    if (data.length > 0) {
      data.forEach(s => {
        if (s.dayOfWeek >= 0 && s.dayOfWeek <= 6) {
          slots.value[s.dayOfWeek] = { dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime, isAvailable: s.isAvailable };
        }
      });
    }
  } catch { }
});
</script>

<style scoped>
.day-row { display:flex;align-items:center;gap:1rem;padding:0.75rem 0;border-bottom:1px solid #f1f5f9; }
.day-row:last-child { border-bottom:none; }
.toggle { width:44px;height:24px;border-radius:12px;border:none;cursor:pointer;position:relative;transition:background 0.2s;flex-shrink:0; }
.toggle-on { background:#2563eb; }
.toggle-off { background:#e2e8f0; }
.toggle-knob { width:18px;height:18px;border-radius:50%;background:white;position:absolute;top:3px;transition:left 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.2); }
.knob-on { left:23px; }
.knob-off { left:3px; }
.day-label { font-weight:600; color:#1e293b; min-width:80px; }
.time-select { flex: 1; }
.until-text { color:#94a3b8; font-size:0.875rem; }
.unavailable-text { flex:1; font-size:0.875rem; color:#94a3b8; }
.error-box { background:#fee2e2; color:#991b1b; padding:0.75rem; border-radius:0.5rem; font-size:0.875rem; margin-top:1rem; }
.spinner { border: 3px solid rgba(0,0,0,0.08); border-top-color: #2563eb; border-radius:50%; width:28px; height:28px; animation: spin 1s linear infinite; }
.spinner-sm { width:18px; height:18px; border-width:2px; }

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .max-w-2xl { padding: 0 1rem; }
}
</style>
