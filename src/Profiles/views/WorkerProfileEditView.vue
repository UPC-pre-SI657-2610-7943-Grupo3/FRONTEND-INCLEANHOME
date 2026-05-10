<template>
  <div class="max-w-2xl">
    <h1 class="page-title mb-6">{{ t('nav.profile') }}</h1>

    <div v-if="loading" class="flex justify-center py-16"><div class="spinner spinner-lg"></div></div>

    <div v-else class="card">
      <div class="text-center mb-6">
        <div class="profile-avatar mx-auto mb-3 avatar-purple">
          <span class="avatar-initial">{{ initials }}</span>
        </div>
        <h2 class="profile-heading">{{ auth.user?.name }}</h2>
        <span class="badge badge-purple mt-1">{{ t('auth.worker') }}</span>
      </div>

      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">{{ t('auth.name') }}</label>
            <input v-model="form.name" class="input-field" />
          </div>
          <div>
            <label class="label">{{ t('auth.phone') }}</label>
            <input v-model="form.phone" class="input-field" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">{{ t('worker.age') }}</label>
            <input v-model.number="form.age" type="number" class="input-field" min="18" max="70" />
          </div>
          <div>
            <label class="label">{{ t('worker.experienceYears') }}</label>
            <input v-model.number="form.experienceYears" type="number" class="input-field" min="0" />
          </div>
        </div>
        <div>
          <label class="label">{{ t('worker.hourlyRate') }}</label>
          <input v-model.number="form.hourlyRate" type="number" class="input-field" min="10" step="5" />
        </div>
        <div>
          <label class="label">{{ t('worker.serviceTypes') }}</label>
          <div class="flex flex-wrap gap-2">
            <label v-for="svc in serviceOptions" :key="svc.value" class="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" :value="svc.value" v-model="form.serviceTypes" />
              <span class="svc-label">{{ svc.label }}</span>
            </label>
          </div>
        </div>
        <div>
          <label class="label">{{ t('worker.zonesLabel') }}</label>
           <div class="flex flex-wrap gap-2 zones-scroll">
            <label v-for="z in zoneOptions" :key="z.value" class="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" :value="z.value" v-model="form.zones" />
               <span class="svc-label">{{ z.label }}</span>
            </label>
          </div>
        </div>
        <div>
          <label class="label">{{ t('worker.bio') }}</label>
           <textarea v-model="form.bio" class="input-field no-resize" rows="3"></textarea>
        </div>

        <div v-if="success" class="success-box">✓ Perfil actualizado</div>
        <div v-if="error" class="error-box">{{ error }}</div>

        <button @click="save" class="btn btn-primary btn-full" :disabled="saving">
          <div v-if="saving" class="spinner spinner-sm"></div>
          {{ saving ? t('common.loading') : t('common.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../Shared/stores/auth.js";
import api from "../../Shared/api.js";

const { t } = useI18n();
const auth = useAuthStore();
const loading = ref(true);
const saving = ref(false);
const success = ref(false);
const error = ref("");

const form = ref({ name: "", phone: "", age: 25, experienceYears: 1, hourlyRate: 25, serviceTypes: [], zones: [], bio: "" });
const initials = computed(() => (auth.user?.name || "W").split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase());

const serviceOptions = computed(() => [
  { value: "limpieza_general", label: t("worker.services.limpieza_general") },
  { value: "cocina", label: t("worker.services.cocina") },
  { value: "lavanderia", label: t("worker.services.lavanderia") },
  { value: "planchado", label: t("worker.services.planchado") },
  { value: "cuidado_ninos", label: t("worker.services.cuidado_ninos") },
  { value: "cuidado_adultos", label: t("worker.services.cuidado_adultos") },
  { value: "jardineria", label: t("worker.services.jardineria") },
  { value: "limpieza_profunda", label: t("worker.services.limpieza_profunda") },
]);

const zoneOptions = computed(() => [
  "miraflores","san_isidro","surco","la_molina","barranco","san_borja",
  "lince","jesus_maria","pueblo_libre","magdalena","san_miguel","callao","los_olivos","san_martin","ate","comas"
].map(v => ({ value: v, label: t(`worker.zones.${v}`) })));

async function save() {
  saving.value = true;
  error.value = "";
  try {
    await api.put("/workers/me/profile", form.value);
    success.value = true;
    setTimeout(() => success.value = false, 3000);
  } catch (e) {
    error.value = e.response?.data?.error || t("common.error");
  } finally { saving.value = false; }
}

onMounted(async () => {
  try {
    const { data } = await api.get("/workers/me/profile");
    form.value = { name: data.name || "", phone: data.phone || "", age: data.age || 25, experienceYears: data.experienceYears || 1, hourlyRate: data.hourlyRate || 25, serviceTypes: data.serviceTypes || [], zones: data.zones || [], bio: data.bio || "" };
  } catch {} finally { loading.value = false; }
});
</script>

<style scoped>
.profile-avatar { width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center; }
.avatar-purple { background:#8b5cf6; }
.avatar-initial { color:white; font-size:1.75rem; font-weight:700; }
.profile-heading { font-size:1.25rem; font-weight:700; color:#1e293b; }
.svc-label { font-size:0.8125rem; }
.zones-scroll { max-height:120px; overflow-y:auto; }
.no-resize { resize:none; }
.success-box { background:#d1fae5; color:#065f46; padding:0.75rem; border-radius:0.5rem; font-size:0.875rem; }
.error-box { background:#fee2e2; color:#991b1b; padding:0.75rem; border-radius:0.5rem; font-size:0.875rem; }
.spinner { border: 3px solid rgba(0,0,0,0.08); border-top-color: #2563eb; border-radius:50%; width:28px; height:28px; animation: spin 1s linear infinite; }
.spinner-lg { width:36px; height:36px; }
.spinner-sm { width:18px; height:18px; border-width:2px; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
