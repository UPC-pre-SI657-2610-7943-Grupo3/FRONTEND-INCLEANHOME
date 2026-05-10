<template>
  <div class="view-container">
    <div class="dashboard-header mb-6">
      <div>
        <h1 class="page-title">{{ t('dashboard.title') }}</h1>
        <p class="page-subtitle">Hola, {{ auth.user?.name?.split(' ')[0] }} 👋</p>
      </div>
    </div>

    <div v-if="loading" class="loader-wrapper"><div class="spinner spinner-lg"></div></div>

    <template v-else>
      <!-- Stats cards -->
      <div class="stats-grid mb-6">
        <div class="card stat-card">
          <div class="stat-icon stat-blue">💰</div>
          <div class="stat-value">S/. {{ stats.netEarnings?.toFixed(0) || '0' }}</div>
          <div class="stat-label">{{ t('dashboard.netEarnings') }}</div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-red">📊</div>
          <div class="stat-value">S/. {{ stats.platformFeeDeducted?.toFixed(0) || '0' }}</div>
          <div class="stat-label">{{ t('dashboard.platformFee') }}</div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-green">✅</div>
          <div class="stat-value">{{ stats.completedServices || 0 }}</div>
          <div class="stat-label">{{ t('dashboard.completedServices') }}</div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-yellow">⭐</div>
          <div class="stat-value">{{ (stats.averageRating || 0).toFixed(1) }}</div>
          <div class="stat-label">{{ t('dashboard.averageRating') }}</div>
        </div>
      </div>

      <div class="content-grid">
        <!-- Monthly earnings chart -->
        <div class="card">
          <h3 class="section-title">{{ t('dashboard.monthlyEarnings') }}</h3>
          <div v-if="!stats.monthlyEarnings?.length" class="empty-msg">Sin datos aún</div>
          <div v-else class="chart">
            <div v-for="m in stats.monthlyEarnings.slice(-6)" :key="m.month" class="chart-bar-wrap">
              <div class="chart-bar-outer">
                <div class="chart-bar" :style="{ height: (m.earnings / maxEarning * 100) + '%', background: '#2563eb' }"></div>
              </div>
              <span class="chart-label">{{ m.month.slice(5) }}</span>
              <span class="chart-val">S/. {{ m.earnings.toFixed(0) }}</span>
            </div>
          </div>
        </div>

        <!-- Recent bookings -->
        <div class="card">
          <h3 class="section-title">{{ t('dashboard.recentBookings') }}</h3>
          <div v-if="!bookings.length" class="empty-msg">{{ t('dashboard.noBookings') }}</div>
          <div v-else class="bookings-list">
            <div v-for="b in bookings.slice(0,5)" :key="b.id" class="booking-row">
              <div class="booking-info">
                <div class="booking-name">{{ b.clientName }}</div>
                <div class="booking-meta">{{ t(`worker.services.${b.serviceType}`) }} · {{ b.date }}</div>
              </div>
              <div class="booking-actions">
                <div class="booking-amount">S/. {{ b.workerEarning?.toFixed(0) }}</div>
                <span :class="statusBadge(b.status)">{{ t(`booking.status.${b.status}`) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../Shared/stores/auth.js";
import api from "../../Shared/api.js";

const { t } = useI18n();
const auth = useAuthStore();
const stats = ref({});
const bookings = ref([]);
const loading = ref(true);

const maxEarning = computed(() => Math.max(...(stats.value.monthlyEarnings || []).map(m => m.earnings), 1));

function statusBadge(s) {
  const map = { pending:'badge badge-yellow', accepted:'badge badge-blue', completed:'badge badge-green', rejected:'badge badge-red', cancelled:'badge badge-gray' };
  return map[s] || 'badge badge-gray';
}

onMounted(async () => {
  try {
    const [s, b] = await Promise.all([api.get("/workers/me/stats"), api.get("/bookings")]);
    stats.value = s.data;
    bookings.value = b.data;
  } catch { } finally { loading.value = false; }
});
</script>

<style scoped>
.view-container { max-width: 1280px; margin: 0 auto; }

.dashboard-header { display: flex; align-items: center; justify-content: space-between; }
.mb-6 { margin-bottom: 1.5rem; }

.page-title { font-size: 1.875rem; font-weight: 800; color: #0f172a; margin-bottom: 0.25rem; }
.page-subtitle { color: #64748b; font-size: 1.125rem; }

.loader-wrapper { display: flex; justify-content: center; padding: 4rem 0; }

.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
@media (min-width: 1024px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }

.stat-card { text-align: center; padding: 1.5rem; transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-4px); }

.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin: 0 auto 0.75rem; }
.stat-blue { background: #dbeafe; color: #2563eb; }
.stat-red { background: #fee2e2; color: #ef4444; }
.stat-green { background: #d1fae5; color: #10b981; }
.stat-yellow { background: #fef3c7; color: #f59e0b; }

.stat-value { font-size: 1.75rem; font-weight: 800; color: #1e293b; line-height: 1.2; }
.stat-label { font-size: 0.875rem; color: #64748b; margin-top: 0.25rem; font-weight: 500; }

.content-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
@media (min-width: 1024px) { .content-grid { grid-template-columns: repeat(2, 1fr); } }

.section-title { font-weight: 700; font-size: 1.125rem; color: #1e293b; margin-bottom: 1.25rem; }

.chart { display: flex; gap: 0.75rem; align-items: flex-end; height: 160px; padding-top: 1rem; }
.chart-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; }
.chart-bar-outer { flex: 1; width: 100%; display: flex; align-items: flex-end; background: #f1f5f9; border-radius: 6px 6px 0 0; }
.chart-bar { width: 100%; min-height: 4px; border-radius: 6px 6px 0 0; transition: height 0.5s ease-out; }
.chart-label { font-size: 0.75rem; font-weight: 600; color: #64748b; }
.chart-val { font-size: 0.6875rem; color: #94a3b8; }

.empty-msg { color: #94a3b8; font-size: 0.875rem; text-align: center; padding: 3rem 0; }

.bookings-list { display: flex; flex-direction: column; gap: 0.75rem; }

.booking-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem; border-radius: 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; transition: border-color 0.2s; }
.booking-row:hover { border-color: #cbd5e1; }

.booking-info { flex: 1; min-width: 0; }
.booking-name { font-weight: 700; font-size: 1rem; color: #1e293b; margin-bottom: 0.125rem; }
.booking-meta { font-size: 0.8125rem; color: #64748b; }

.booking-actions { text-align: right; }
.booking-amount { font-weight: 800; color: #2563eb; margin-bottom: 0.25rem; font-size: 1rem; }

.spinner { border: 3px solid rgba(0,0,0,0.08); border-top-color: #2563eb; border-radius: 50%; width: 28px; height: 28px; animation: spin 1s linear infinite; }
.spinner-lg { width: 36px; height: 36px; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
