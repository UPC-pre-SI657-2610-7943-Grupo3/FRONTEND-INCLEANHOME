<template>
  <div class="view-container">
    <h1 class="page-title mb-6">{{ t('nav.requests') }}</h1>

    <div v-if="loading" class="loader-wrapper"><div class="spinner spinner-lg"></div></div>

    <div v-else-if="!bookings.length" class="card empty-state">
      <div class="empty-illustration">📋</div>
      <p class="empty-text">Sin solicitudes de servicio</p>
    </div>

    <div v-else class="booking-list">
      <!-- Tabs -->
      <div class="tabs-container">
        <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value"
          :class="['btn btn-sm', activeTab === tab.value ? 'btn-primary' : 'btn-secondary']">
          {{ tab.label }} <span v-if="tabCount(tab.value)" class="tab-badge" :class="activeTab === tab.value ? 'badge-active' : 'badge-inactive'">{{ tabCount(tab.value) }}</span>
        </button>
      </div>

      <div v-for="b in filteredBookings" :key="b.id" class="card">
        <div class="booking-header">
          <div class="client-info">
            <div class="avatar-sm avatar-aqua">
              <span class="avatar-initial">{{ (b.clientName || 'C')[0] }}</span>
            </div>
            <div>
              <div class="client-name">{{ b.clientName }}</div>
              <div class="client-service">{{ t(`worker.services.${b.serviceType}`) }}</div>
            </div>
          </div>
          <span :class="statusBadge(b.status)">{{ t(`booking.status.${b.status}`) }}</span>
        </div>

        <div class="meta-row">
          <span class="meta-item">📅 {{ b.date }}</span>
          <span class="meta-item">⏰ {{ b.startTime }} – {{ b.endTime }} ({{ b.hours }}h)</span>
          <span class="meta-item">📍 {{ b.address }}</span>
        </div>

        <div v-if="b.notes" class="notes-box">
          💬 {{ b.notes }}
        </div>

        <div class="card-footer">
          <div>
            <span class="earning-label">Tu ganancia: </span>
            <span class="earning-amount">S/. {{ b.workerEarning }}</span>
            <span class="total-amount">(total S/. {{ b.totalAmount }})</span>
          </div>
          <div class="action-buttons" v-if="b.status === 'pending'">
            <button @click="updateStatus(b.id, 'rejected')" class="btn btn-danger btn-sm">{{ t('common.reject') }}</button>
            <button @click="updateStatus(b.id, 'accepted')" class="btn btn-success btn-sm">{{ t('common.accept') }}</button>
          </div>
          <div class="action-buttons" v-else-if="b.status === 'accepted'">
            <button @click="updateStatus(b.id, 'completed')" class="btn btn-success btn-sm">✅ {{ t('common.complete') }}</button>
            <router-link :to="`/worker/messages/${b.clientId}`" class="btn btn-secondary btn-sm">💬</router-link>
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
const bookings = ref([]);
const loading = ref(true);
const activeTab = ref("pending");

const tabs = [
  { value: "pending", label: "Pendientes" },
  { value: "accepted", label: "Aceptadas" },
  { value: "completed", label: "Completadas" },
  { value: "all", label: "Todas" },
];

const filteredBookings = computed(() =>
  activeTab.value === "all" ? bookings.value : bookings.value.filter(b => b.status === activeTab.value)
);
const tabCount = (tab) => tab === "all" ? bookings.value.length : bookings.value.filter(b => b.status === tab).length;

function statusBadge(s) {
  return { pending:"badge badge-yellow", accepted:"badge badge-blue", completed:"badge badge-green", rejected:"badge badge-red", cancelled:"badge badge-gray" }[s] || "badge badge-gray";
}

async function updateStatus(id, status) {
  await api.patch(`/bookings/${id}/status`, { status });
  toast.success(status === "accepted" ? "Reserva aceptada" : status === "completed" ? "Servicio completado" : "Reserva rechazada");
  await load();
}

async function load() {
  loading.value = true;
  const { data } = await api.get("/bookings");
  bookings.value = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  loading.value = false;
}

onMounted(load);
</script>

<style scoped>
.view-container {
  max-width: 1024px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #0f172a;
}
.mb-6 { margin-bottom: 1.5rem; }

.loader-wrapper {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
}

.empty-state {
  text-align: center;
  padding: 4rem 0;
}
.empty-illustration { font-size: 3rem; margin-bottom: 1rem; }
.empty-text { color: #64748b; }

.booking-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tabs-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.1rem 0.4rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.25rem;
}
.badge-active { background:white; color:#2563eb; }
.badge-inactive { background:#e2e8f0; color:#475569; }

.booking-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-sm { width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.avatar-aqua { background:#06b6d4; }
.avatar-initial { color:white; font-size:0.875rem; font-weight:700; }
.client-name { font-weight:700; color:#1e293b; }
.client-service { font-size:0.8125rem; color:#64748b; }

.meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #64748b;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.notes-box { 
  margin-top:0.75rem; 
  font-size:0.875rem; 
  color:#475569; 
  background:#f8fafc; 
  padding:0.75rem; 
  border-radius:0.5rem; 
  border: 1px solid #e2e8f0;
}

.card-footer { 
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top:1px solid #f1f5f9; 
  margin-top:0.875rem; 
  padding-top:0.875rem; 
}
.earning-label { font-size:0.8125rem; color:#64748b; }
.earning-amount { font-weight:700; color:#10b981; margin-left:0.25rem; }
.total-amount { font-size:0.75rem; color:#94a3b8; margin-left:0.25rem; }

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.spinner { border: 3px solid rgba(0,0,0,0.08); border-top-color: #2563eb; border-radius:50%; width:28px; height:28px; animation: spin 1s linear infinite; }
.spinner-lg { width:36px; height:36px; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
