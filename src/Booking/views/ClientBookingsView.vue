<template>
  <div>
    <h1 class="page-title mb-6">{{ t('nav.bookings') }}</h1>

    <div v-if="loading" class="flex justify-center py-16"><div class="spinner spinner-lg"></div></div>

    <div v-else-if="!bookings.length" class="text-center py-16 card empty-state">
      <div class="empty-illustration">📅</div>
      <p class="empty-text">{{ t('dashboard.noBookings') }}</p>
      <router-link to="/client/search" class="btn btn-primary mt-4">Buscar trabajadoras</router-link>
    </div>

    <div v-else class="flex flex-col gap-4">
      <div v-for="b in bookings" :key="b.id" class="card">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="worker-avatar-sm avatar-blue">
              <span class="avatar-initial">{{ (b.workerName || 'W')[0] }}</span>
            </div>
            <div>
              <div class="worker-name">{{ b.workerName }}</div>
              <div class="worker-service">{{ t(`worker.services.${b.serviceType}`) }}</div>
            </div>
          </div>
          <span :class="statusBadge(b.status)">{{ t(`booking.status.${b.status}`) }}</span>
        </div>

        <div class="flex items-center gap-6 mt-3 meta-row">
          <span>📅 {{ b.date }}</span>
          <span>⏰ {{ b.startTime }} – {{ b.endTime }}</span>
          <span>📍 {{ b.address?.slice(0,30) }}...</span>
        </div>

        <div class="card-footer flex items-center justify-between">
          <div>
            <span class="total-label">Total: </span>
            <span class="total-amount">S/. {{ b.totalAmount }}</span>
          </div>
          <div class="flex gap-2">
            <button v-if="b.status === 'completed' && !b._reviewed" @click="openReview(b)" class="btn btn-outline btn-sm">⭐ Calificar</button>
            <button v-if="b.status === 'pending'" @click="cancelBooking(b.id)" class="btn btn-danger btn-sm">{{ t('common.cancel') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Review modal -->
    <div v-if="reviewBooking" class="modal-overlay" @click.self="reviewBooking = null">
      <div class="modal-box">
        <h3 class="card-title">Calificar servicio</h3>
        <p class="muted-text mb-3">{{ reviewBooking.workerName }}</p>
        <div class="flex gap-2 mb-4">
          <button v-for="i in 5" :key="i" @click="reviewForm.rating = i" class="rating-btn" :style="{ opacity: i <= reviewForm.rating ? 1 : 0.3 }">⭐</button>
        </div>
        <textarea v-model="reviewForm.comment" class="input-field mb-4" rows="3" placeholder="Escribe tu reseña..."></textarea>
        <div class="flex gap-3">
          <button @click="reviewBooking = null" class="btn btn-secondary flex-1">{{ t('common.cancel') }}</button>
          <button @click="submitReview" class="btn btn-primary flex-1" :disabled="!reviewForm.rating">Enviar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useToastStore } from "../../Shared/stores/toast.js";
import api from "../../Shared/api.js";

const { t } = useI18n();
const toast = useToastStore();
const bookings = ref([]);
const loading = ref(true);
const reviewBooking = ref(null);
const reviewForm = ref({ rating: 0, comment: "" });

function statusBadge(s) {
  return { pending:"badge badge-yellow", accepted:"badge badge-blue", completed:"badge badge-green", rejected:"badge badge-red", cancelled:"badge badge-gray" }[s] || "badge badge-gray";
}

function openReview(b) { reviewBooking.value = b; reviewForm.value = { rating: 0, comment: "" }; }

async function cancelBooking(id) {
  await api.patch(`/bookings/${id}/status`, { status: "cancelled" });
  await load();
  toast.success("Reserva cancelada");
}

async function submitReview() {
  await api.post("/reviews", { bookingId: reviewBooking.value.id, workerId: reviewBooking.value.workerId, ...reviewForm.value });
  reviewBooking.value = null;
  toast.success("¡Gracias por tu reseña!");
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
.worker-avatar-sm { width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:1rem; }
.modal-box { background:white;border-radius:1rem;padding:1.5rem;width:100%;max-width:400px; }
.avatar-blue { background:#2563eb; }
.avatar-initial { color:white; font-size:0.875rem; font-weight:700; }
.worker-name { font-weight:700; color:#1e293b; }
.worker-service { font-size:0.8125rem; color:#64748b; }
.meta-row { font-size:0.875rem; color:#64748b; }
.card-footer { border-top:1px solid #f1f5f9; margin-top:0.875rem; padding-top:0.875rem; }
.total-label { font-size:0.8125rem; color:#64748b; }
.total-amount { font-weight:700; color:#1e293b; margin-left:0.25rem; }
.empty-state .empty-illustration { font-size:3rem; margin-bottom:1rem; }
.empty-text { color:#64748b; }
.card-title { font-weight:700; margin-bottom:1rem; }
.muted-text { font-size:0.875rem; color:#64748b; }
.rating-btn { font-size:1.75rem; background:none; border:none; cursor:pointer; }
</style>
