<template>
  <div class="max-w-2xl">
    <h1 class="page-title mb-2">{{ t('nav.payments') }}</h1>
    <p class="page-subtitle mb-6">{{ t('payments.subtitle') }}</p>

    <div v-if="loading" class="flex justify-center py-16"><div class="spinner spinner-lg"></div></div>

    <div v-else class="flex flex-col gap-4">
      <!-- Existing payment methods -->
      <div v-if="methods.length" class="card">
        <h3 class="card-title">{{ t('payments.saved') }}</h3>
        <div class="flex flex-col gap-3">
          <div v-for="m in methods" :key="m.id" class="method-row">
            <span class="payment-icon">{{ paymentIcon(m.type) }}</span>
            <div class="flex-1">
              <div class="method-label">{{ m.label }}</div>
              <div v-if="m.details" class="method-details">{{ m.details }}</div>
              <span v-if="m.isDefault" class="badge badge-blue badge-small">Principal</span>
            </div>
            <div class="flex gap-2">
              <button v-if="!m.isDefault" @click="setDefault(m.id)" class="btn btn-secondary btn-sm">{{ t('payments.setDefault') }}</button>
              <button @click="deleteMethod(m.id)" class="btn btn-danger btn-sm">✕</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add new method -->
      <div class="card">
        <h3 class="card-title">{{ t('payments.addNew') }}</h3>
        <div class="flex flex-col gap-3">
          <div>
            <label class="label">{{ t('booking.paymentMethod') }}</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button v-for="(lbl, val) in paymentTypes" :key="val" @click="form.type = val" :class="['btn payment-type-btn', form.type === val ? 'btn-primary' : 'btn-secondary']">
                  <span class="payment-type-icon">{{ paymentIcon(val) }}</span>
                  <span class="payment-type-label">{{ lbl }}</span>
                </button>
            </div>
          </div>
          <div>
            <label class="label">{{ t('payments.label') }}</label>
            <input v-model="form.label" class="input-field" :placeholder="t('payments.labelPlaceholder')" />
          </div>
          <div>
            <label class="label">{{ t('payments.details') }}</label>
            <input v-model="form.details" class="input-field" :placeholder="t('payments.detailsPlaceholder')" />
          </div>
            <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="form.isDefault" />
            <span class="mark-default-text">{{ t('payments.markDefault') }}</span>
          </label>

          <div v-if="error" class="error-box">{{ error }}</div>

          <button @click="addMethod" class="btn btn-primary" :disabled="!form.label || saving">
            <div v-if="saving" class="spinner spinner-sm"></div>
            {{ saving ? t('common.loading') : t('payments.add') }}
          </button>
        </div>
      </div>

      <!-- Info box -->
      <div class="card secure-card">
        <div class="flex gap-3">
          <span class="secure-icon">🔒</span>
          <div>
            <div class="secure-title">{{ t('payments.secureTitle') }}</div>
            <p class="secure-desc">{{ t('payments.secureDesc') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useToastStore } from "../../Shared/stores/toast.js";
import api from "../../Shared/api.js";

const { t } = useI18n();
const toast = useToastStore();
const methods = ref([]);
const loading = ref(true);
const saving = ref(false);
const error = ref("");

const form = ref({ type: "yape", label: "", details: "", isDefault: false });

const paymentTypes = computed(() => ({
  cash: t("booking.paymentTypes.cash"),
  card: t("booking.paymentTypes.card"),
  yape: t("booking.paymentTypes.yape"),
  plin: t("booking.paymentTypes.plin"),
  bank_transfer: t("booking.paymentTypes.bank_transfer"),
}));

function paymentIcon(type) {
  return { cash: "💵", card: "💳", yape: "📱", plin: "📲", bank_transfer: "🏦" }[type] || "💰";
}

async function addMethod() {
  if (!form.value.label) return;
  saving.value = true;
  error.value = "";
  try {
    const { data } = await api.post("/payments/methods", form.value);
    methods.value.push(data);
    form.value = { type: "yape", label: "", details: "", isDefault: false };
    toast.success(t("common.success"));
  } catch (e) {
    error.value = e.response?.data?.error || t("common.error");
  } finally { saving.value = false; }
}

async function setDefault(id) {
  await api.patch(`/payments/methods/${id}/default`);
  methods.value.forEach(m => { m.isDefault = m.id === id; });
  toast.success(t("common.success"));
}

async function deleteMethod(id) {
  await api.delete(`/payments/methods/${id}`);
  methods.value = methods.value.filter(m => m.id !== id);
  toast.success(t("common.success"));
}

onMounted(async () => {
  try {
    const { data } = await api.get("/payments/methods");
    methods.value = data;
  } catch {} finally { loading.value = false; }
});
</script>

<style scoped>
.card-title { font-weight:700; color:#1e293b; margin-bottom:1rem; }
.method-row { display:flex; align-items:center; gap:1rem; padding:0.75rem; border:1.5px solid #e2e8f0; border-radius:0.75rem; }
.payment-icon { font-size:1.75rem; }
.method-label { font-weight:600; color:#1e293b; }
.method-details { font-size:0.8125rem; color:#64748b; }
.badge-small { margin-top:0.25rem; font-size:0.7rem; }
.payment-type-btn { flex-direction:column; gap:0.25rem; padding:0.75rem; }
.payment-type-icon { font-size:1.5rem; }
.payment-type-label { font-size:0.8125rem; }
.mark-default-text { font-size:0.875rem; color:#475569; }
.error-box { background:#fee2e2; color:#991b1b; padding:0.75rem; border-radius:0.5rem; font-size:0.875rem; }
.secure-card { background:#f0fdf4; border-color:#a7f3d0; }
.secure-icon { font-size:1.25rem; }
.secure-title { font-weight:600; color:#065f46; margin-bottom:0.25rem; }
.secure-desc { font-size:0.875rem; color:#047857; }
.spinner { border: 3px solid rgba(0,0,0,0.08); border-top-color: #2563eb; border-radius:50%; width:28px; height:28px; animation: spin 1s linear infinite; }
.spinner-lg { width:36px; height:36px; }
.spinner-sm { width:18px; height:18px; border-width:2px; }

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .max-w-2xl { padding: 0 1rem; }
  .method-row { flex-direction:column; align-items:flex-start; }
}
</style>
