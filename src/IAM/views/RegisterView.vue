<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8 auth-bg">
    <div class="w-full max-w-lg">
      <!-- Logo -->
      <div class="text-center mb-6">
        <router-link to="/login" class="inline-flex items-center gap-2 mb-2">
          <div class="logo-small">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span class="brand">InClean<span class="brand-accent">Home</span></span>
        </router-link>
      </div>

      <!-- Step 1: Select role -->
      <Transition name="fade" mode="out-in">
        <div v-if="step === 1" class="card card-elevated">
          <h2 class="card-title small">{{ t('auth.registerTitle') }}</h2>
          <p class="card-subtitle">{{ t('auth.selectRole') }}</p>
          <div class="grid grid-cols-2 gap-4">
              <button @click="selectRole('client')" :class="['role-card', selectedRole === 'client' ? 'role-selected' : '']">
                <div class="role-emoji">🏠</div>
                <div class="role-title">{{ t('auth.client') }}</div>
                <div class="role-desc">{{ t('auth.clientDesc') }}</div>
              </button>
            <button @click="selectRole('worker')"
                :class="['role-card', selectedRole === 'worker' ? 'role-selected-w' : '']">
                <div class="role-emoji">✨</div>
                <div class="role-title">{{ t('auth.worker') }}</div>
                <div class="role-desc">{{ t('auth.workerDesc') }}</div>
              </button>
          </div>
            <button @click="step = 2" class="btn btn-primary btn-full btn-lg btn-continue" :disabled="!selectedRole">
            Continuar →
          </button>
            <div class="card-footer">
              {{ t('auth.alreadyAccount') }}
              <router-link to="/login" class="link-primary"> {{ t('auth.login') }}</router-link>
            </div>
        </div>

        <!-- Step 2: Fill form -->
        <div v-else-if="step === 2" class="card card-elevated">
          <button @click="step = 1" class="back-btn">← {{ t('common.back') }}</button>
          <h2 class="card-title">{{ selectedRole === 'client' ? t('auth.client') : t('auth.worker') }} — {{ t('auth.registerTitle') }}</h2>

          <form @submit.prevent="handleRegister" class="flex flex-col gap-4">
            <!-- Common fields -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">{{ t('auth.name') }}</label>
                <input v-model="form.name" type="text" class="input-field" required />
              </div>
              <div>
                <label class="label">{{ t('auth.phone') }}</label>
                <input v-model="form.phone" type="tel" class="input-field" placeholder="+51 999 999 999" />
              </div>
            </div>
            <div>
              <label class="label">{{ t('auth.email') }}</label>
              <input v-model="form.email" type="email" class="input-field" required />
            </div>
            <div>
              <label class="label">{{ t('auth.password') }} <span class="hint-text">({{ t('auth.minPassword') }})</span></label>
              <input v-model="form.password" type="password" class="input-field" required minlength="8" />
            </div>

            <!-- Worker-specific fields -->
            <template v-if="selectedRole === 'worker'">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">{{ t('worker.age') }}</label>
                  <input v-model.number="form.age" type="number" class="input-field" required min="18" max="70" />
                </div>
                <div>
                  <label class="label">{{ t('worker.gender') }}</label>
                  <select v-model="form.gender" class="input-field" required>
                    <option value="female">{{ t('worker.female') }}</option>
                    <option value="male">{{ t('worker.male') }}</option>
                    <option value="other">{{ t('worker.other') }}</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="label">{{ t('worker.serviceTypes') }}</label>
                <div class="flex flex-wrap gap-2 mt-1">
                  <label v-for="svc in serviceOptions" :key="svc.value" class="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" :value="svc.value" v-model="form.serviceTypes" class="rounded" />
                    <span class="svc-label">{{ svc.label }}</span>
                  </label>
                </div>
              </div>
              <div>
                <label class="label">{{ t('worker.zonesLabel') }}</label>
                <div class="flex flex-wrap gap-2 mt-1 zones-scroll">
                  <label v-for="z in zoneOptions" :key="z.value" class="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" :value="z.value" v-model="form.zones" class="rounded" />
                    <span class="svc-label">{{ z.label }}</span>
                  </label>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">{{ t('worker.hourlyRate') }}</label>
                  <input v-model.number="form.hourlyRate" type="number" class="input-field" required min="10" step="5" />
                </div>
                <div>
                  <label class="label">{{ t('worker.experienceYears') }}</label>
                  <input v-model.number="form.experienceYears" type="number" class="input-field" min="0" max="50" />
                </div>
              </div>
              <div>
                <label class="label">{{ t('worker.bio') }}</label>
                <textarea v-model="form.bio" class="input-field no-resize" rows="2"></textarea>
              </div>
            </template>

            <div v-if="error" class="error-box">{{ error }}</div>

            <button type="submit" class="btn btn-primary btn-full btn-lg" :disabled="loading">
              <div v-if="loading" class="spinner spinner-sm"></div>
              {{ loading ? t('common.loading') : t('auth.register') }}
            </button>
          </form>
        </div>
      </Transition>

      <div class="text-center mt-4">
        <button @click="toggleLang" class="lang-btn">
          {{ locale === 'es' ? '🇺🇸 English' : '🇵🇪 Español' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../Shared/stores/auth.js";
import api from "../../Shared/api.js";

const { t, locale } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const step = ref(1);
const selectedRole = ref("");
const loading = ref(false);
const error = ref("");

const form = ref({
  name: "", email: "", password: "", phone: "",
  age: 25, gender: "female", serviceTypes: [], zones: [],
  hourlyRate: 25, experienceYears: 1, bio: "",
});

function toggleLang() { locale.value = locale.value === "es" ? "en" : "es"; }
function selectRole(role) { selectedRole.value = role; }

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
  "miraflores", "san_isidro", "surco", "la_molina", "barranco", "san_borja",
  "lince", "jesus_maria", "pueblo_libre", "magdalena", "san_miguel", "callao",
  "los_olivos", "san_martin", "ate", "comas"
].map(v => ({ value: v, label: t(`worker.zones.${v}`) })));

async function handleRegister() {
  if (selectedRole.value === "worker" && form.value.serviceTypes.length === 0) {
    error.value = "Selecciona al menos un tipo de servicio";
    return;
  }
  loading.value = true;
  error.value = "";
  try {
    const endpoint = selectedRole.value === "client" ? "/auth/register/client" : "/auth/register/worker";
    const payload = selectedRole.value === "client"
      ? { name: form.value.name, email: form.value.email, password: form.value.password, phone: form.value.phone }
      : { ...form.value };
    const { data } = await api.post(endpoint, payload);
    auth.setAuth(data.user, data.token);
    if (selectedRole.value === "worker") {
      router.push("/upload-documents");
    } else {
      router.push("/client/search");
    }
  } catch (e) {
    error.value = e.response?.data?.error || t("common.error");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-bg { background: linear-gradient(135deg,#eff6ff 0%,#f0fdf4 100%); }
.logo-small { width:40px; height:40px; background: linear-gradient(135deg,#2563eb,#06b6d4); border-radius:12px; display:flex; align-items:center; justify-content:center; }
.brand { font-size:1.5rem; font-weight:800; color:#1e293b; }
.brand-accent { color:#2563eb; }
.card-elevated { box-shadow:0 20px 40px rgba(0,0,0,0.08); }
.card-title.small { font-size:1.25rem; font-weight:700; color:#1e293b; margin-bottom:0.5rem; }
.card-subtitle { color:#64748b; font-size:0.875rem; margin-bottom:1.5rem; }
.role-card { padding:1.5rem; border-radius:1rem; border:2px solid; cursor:pointer; text-align:left; transition:all 0.15s; background:white; }
.role-emoji { font-size:2rem; margin-bottom:0.75rem; }
.role-title { font-weight:700; color:#1e293b; margin-bottom:0.375rem; }
.role-desc { font-size:0.8125rem; color:#64748b; }
.role-selected { border-color:#2563eb; background:#eff6ff; }
.role-selected-w { border-color:#8b5cf6; background:#ede9fe; }
.btn-continue { margin-top:1.5rem; }
.card-footer { text-align:center; margin-top:1rem; font-size:0.875rem; color:#64748b; }
.back-btn { background:none; border:none; cursor:pointer; color:#64748b; font-size:0.875rem; display:flex; align-items:center; gap:0.5rem; margin-bottom:1rem; }
.hint-text { color:#94a3b8; font-weight:400; }
.svc-label { font-size:0.8125rem; color:#374151; }
.zones-scroll { max-height:120px; overflow-y:auto; }
.no-resize { resize:none; }
.error-box { background:#fee2e2; color:#991b1b; padding:0.75rem; border-radius:0.5rem; font-size:0.875rem; }
.spinner { border: 3px solid rgba(0,0,0,0.08); border-top-color: #2563eb; border-radius:50%; width:28px; height:28px; animation: spin 1s linear infinite; }
.spinner-sm { width:18px; height:18px; border-width:2px; }
.lang-btn { font-size:0.8125rem; color:#64748b; background:none; border:none; cursor:pointer; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
