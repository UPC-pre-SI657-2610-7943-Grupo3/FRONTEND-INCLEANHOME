<template>
  <div class="max-w-lg">
    <h1 class="page-title mb-6">{{ t('nav.profile') }}</h1>
    <div class="card">
      <div class="text-center mb-6">
        <div class="profile-avatar mx-auto mb-3 avatar-blue">
          <span class="avatar-initial">{{ initials }}</span>
        </div>
        <h2 class="profile-heading">{{ auth.user?.name }}</h2>
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
        <div v-if="success" class="success-box">✓ {{ t('common.success') }}</div>
        <button @click="save" class="btn btn-primary btn-full" :disabled="saving">
          {{ saving ? t('common.loading') : t('common.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../Shared/stores/auth.js";

const { t } = useI18n();
const auth = useAuthStore();
const saving = ref(false);
const success = ref(false);
const form = ref({ name: auth.user?.name || "", phone: auth.user?.phone || "" });
const initials = computed(() => (auth.user?.name || "U").split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase());

async function save() {
  saving.value = true;
  await new Promise(r => setTimeout(r, 500));
  saving.value = false;
  success.value = true;
  setTimeout(() => success.value = false, 3000);
}
</script>

<style scoped>
.profile-avatar { width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center; }
.avatar-blue { background:#2563eb; }
.avatar-initial { color:white; font-size:1.75rem; font-weight:700; }
.profile-heading { font-size:1.25rem; font-weight:700; color:#1e293b; }
.input-disabled { background:#f8fafc; cursor:not-allowed; }
.success-box { background:#d1fae5; color:#065f46; padding:0.75rem; border-radius:0.5rem; font-size:0.875rem; }
</style>
