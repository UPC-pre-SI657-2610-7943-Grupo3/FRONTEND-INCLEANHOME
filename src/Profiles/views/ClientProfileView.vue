<template>
  <div class="max-w-lg">
    <h1 class="page-title mb-6">{{ t('nav.profile') }}</h1>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="spinner spinner-lg"></div>
    </div>

    <div v-else class="card">
      <div class="text-center mb-6">
        <div class="profile-avatar mx-auto mb-3 avatar-blue">
          <span class="avatar-initial">{{ initials }}</span>
        </div>
        <h2 class="profile-heading">{{ form.name }}</h2>
        <span class="badge badge-blue mt-1">{{ t('auth.client') }}</span>
      </div>
      <div class="flex flex-col gap-4">
        <div>
          <label class="label">{{ t('auth.name') }}</label>
          <input v-model="form.name" class="input-field" />
        </div>
        <div>
          <label class="label">{{ t('auth.email') }}</label>
          <input :value="auth.user?.email" class="input-field input-disabled" disabled />
        </div>
        <div>
          <label class="label">{{ t('auth.phone') }}</label>
          <input v-model="form.phone" class="input-field" />
        </div>
        <div v-if="error" class="error-box">⚠ {{ error }}</div>
        <div v-if="success" class="success-box">✓ {{ t('common.success') }}</div>
        <button @click="save" class="btn btn-primary btn-full" :disabled="saving">
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
const saving = ref(false);
const success = ref(false);
const error = ref("");
const loading = ref(true);
const form = ref({ name: "", phone: "" });
const initials = computed(() => (form.value.name || "U").split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase());

onMounted(async () => {
  try {
    const { data } = await api.get("/my-profile");
    form.value = { name: data.name || "", phone: data.phone || "" };
  } catch (err) {
    error.value = t('common.error') || "Error al cargar el perfil";
  } finally {
    loading.value = false;
  }
});

async function save() {
  if (!form.value.name.trim()) {
    error.value = t('validation.nameRequired') || "El nombre es requerido";
    return;
  }

  saving.value = true;
  error.value = "";

  try {
    const { data } = await api.patch("/my-profile", {
      name: form.value.name,
      phone: form.value.phone
    });

    // Actualizar el auth store con los nuevos datos
    const updatedUser = { ...auth.user, ...data };
    auth.user = updatedUser;
    localStorage.setItem("inclean_user", JSON.stringify(updatedUser));

    success.value = true;
    setTimeout(() => success.value = false, 3000);
  } catch (err) {
    error.value = err.response?.data?.message || t('common.error') || "Error al guardar los cambios";
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.profile-avatar { width:80px; height:80px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
.avatar-blue { background:#2563eb; }
.avatar-initial { color:white; font-size:1.75rem; font-weight:700; }
.profile-heading { font-size:1.25rem; font-weight:700; color:#1e293b; }
.input-disabled { background:#f8fafc; cursor:not-allowed; }
.success-box { background:#d1fae5; color:#065f46; padding:0.75rem; border-radius:0.5rem; font-size:0.875rem; }
.error-box { background:#fee2e2; color:#991b1b; padding:0.75rem; border-radius:0.5rem; font-size:0.875rem; }
.spinner { border: 3px solid rgba(0,0,0,0.08); border-top-color: #2563eb; border-radius:50%; width:28px; height:28px; animation: spin 1s linear infinite; }
.spinner-lg { width:36px; height:36px; }

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .profile-avatar { width:70px; height:70px; }
  .avatar-initial { font-size:1.5rem; }
  .profile-heading { font-size:1.125rem; }
}
</style>
