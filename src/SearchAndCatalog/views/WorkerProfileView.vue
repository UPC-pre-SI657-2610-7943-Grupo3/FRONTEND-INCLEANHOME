<template>
  <div v-if="loading" class="flex justify-center py-16"><div class="spinner spinner-lg"></div></div>
  <div v-else-if="!worker" class="text-center py-16"><p class="muted-text">Trabajadora no encontrada</p></div>
  <div v-else>
    <button @click="$router.back()" class="btn btn-secondary btn-sm mb-4">← {{ t('common.back') }}</button>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Profile card -->
      <div class="lg:col-span-1">
        <div class="card text-center">
          <div class="worker-avatar-lg mx-auto mb-4" :style="{ background: avatarBg }">
            <span class="avatar-initials-lg">{{ initials }}</span>
          </div>
          <h1 class="profile-name">{{ worker.name }}</h1>

          <div class="flex items-center justify-center gap-1 mt-1">
            <span v-for="i in 5" :key="i" :style="{ color: i <= Math.round(worker.averageRating || 0) ? '#f59e0b' : '#e2e8f0' }">★</span>
            <span class="rating-value">{{ (worker.averageRating || 0).toFixed(1) }}</span>
            <span class="rating-count">({{ worker.totalServices || 0 }})</span>
          </div>

           <div v-if="worker.documentsVerified" class="verified-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M9 11l3 3L22 4"/></svg>
            {{ t('profile.verified') }}
          </div>

           <div class="worker-rate">S/. {{ worker.hourlyRate }}</div>
           <div class="per-hour">{{ t('search.perHour') }}</div>

          <div class="flex flex-col gap-2 mt-4">
            <router-link :to="`/client/worker/${worker.id}/book`" class="btn btn-primary btn-full">📅 {{ t('profile.book') }}</router-link>
            <router-link :to="`/client/messages/${worker.id}`" class="btn btn-secondary btn-full">💬 {{ t('profile.contact') }}</router-link>
          </div>

          <div class="profile-info-section">
            <div v-if="worker.age" class="info-row"><span>🎂</span><span>{{ worker.age }} años</span></div>
            <div v-if="worker.gender" class="info-row"><span>👤</span><span>{{ t(`worker.${worker.gender}`) }}</span></div>
            <div v-if="worker.experienceYears" class="info-row"><span>⏱️</span><span>{{ worker.experienceYears }} años de experiencia</span></div>
            <div v-if="worker.phone" class="info-row"><span>📞</span><span>{{ worker.phone }}</span></div>
          </div>
        </div>
      </div>

      <!-- Right: Details -->
      <div class="lg:col-span-2 flex flex-col gap-5">
        <!-- Bio -->
        <div v-if="worker.bio" class="card">
            <h3 class="section-title">Acerca de mí</h3>
           <p class="bio-text">{{ worker.bio }}</p>
        </div>

        <!-- Services -->
        <div class="card">
          <h3 class="section-title">{{ t('profile.services') }}</h3>
            <div class="flex flex-wrap gap-2">
            <span v-for="svc in worker.serviceTypes" :key="svc" class="badge badge-blue badge-md">
              {{ t(`worker.services.${svc}`) }}
            </span>
          </div>
        </div>

        <!-- Zones -->
        <div class="card">
          <h3 class="section-title">{{ t('profile.workZones') }}</h3>
            <div class="flex flex-wrap gap-2">
            <span v-for="zone in worker.zones" :key="zone" class="badge badge-gray badge-md">
              📍 {{ t(`worker.zones.${zone}`) }}
            </span>
          </div>
        </div>

        <!-- Availability -->
        <div class="card">
          <h3 class="section-title">{{ t('profile.availability') }}</h3>
           <div v-if="availability.length === 0" class="muted-text">Sin disponibilidad configurada</div>
           <div v-else class="flex flex-wrap gap-2">
             <span v-for="slot in availability.filter(s => s.isAvailable)" :key="slot.id" class="badge badge-green badge-md">
               {{ days[slot.dayOfWeek] }} {{ slot.startTime }}–{{ slot.endTime }}
             </span>
           </div>
        </div>

        <!-- Reviews -->
        <div class="card">
          <h3 class="section-title">{{ t('profile.reviews') }}</h3>
           <div v-if="reviews.length === 0" class="muted-text">{{ t('profile.noReviews') }}</div>
           <div v-else class="flex flex-col gap-4">
             <div v-for="r in reviews" :key="r.id" class="review-row">
               <div class="flex items-center justify-between mb-1">
                 <span class="review-author">{{ r.clientName || 'Cliente' }}</span>
                 <div class="flex">
                   <span v-for="i in 5" :key="i" :style="{ color: i <= r.rating ? '#f59e0b' : '#e2e8f0' }" class="review-star">★</span>
                 </div>
               </div>
               <p class="review-text">{{ r.comment }}</p>
               <p class="review-date">{{ formatDate(r.createdAt) }}</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import api from "../../Shared/api.js";

const { t } = useI18n();
const route = useRoute();
const worker = ref(null);
const availability = ref([]);
const reviews = ref([]);
const loading = ref(true);

const days = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const colors = ["#2563eb","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444"];
const initials = computed(() => worker.value?.name?.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase() || "?");
const avatarBg = computed(() => colors[(worker.value?.id || 0) % colors.length]);

function formatDate(d) { return d ? new Date(d).toLocaleDateString("es-PE", { year:"numeric", month:"long", day:"numeric" }) : ""; }

onMounted(async () => {
  try {
    const id = route.params.id;
    const [w, av, rv] = await Promise.all([
      api.get(`/workers/${id}`),
      api.get(`/workers/${id}/availability`),
      api.get(`/reviews/worker/${id}`),
    ]);
    worker.value = w.data;
    availability.value = av.data;
    reviews.value = rv.data;
  } catch { } finally { loading.value = false; }
});
</script>

<style scoped>
.worker-avatar-lg { width:88px;height:88px;border-radius:50%;display:flex;align-items:center;justify-content:center; }
.avatar-initials-lg { font-size:2rem;font-weight:700;color:white; }
.profile-name { font-size:1.375rem;font-weight:800;color:#1e293b; margin:0; }
.section-title { font-size:1rem;font-weight:700;color:#1e293b;margin-bottom:0.875rem; }
.info-row { display:flex;align-items:center;gap:0.5rem;font-size:0.875rem;color:#475569;margin-bottom:0.5rem; }
.worker-avatar { width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.verified-badge { display:inline-flex; align-items:center; gap:0.25rem; margin-top:0.5rem; background:#d1fae5; color:#065f46; padding:0.3rem 0.75rem; border-radius:9999px; font-size:0.8125rem; font-weight:500; }
.worker-rate { font-size:1.5rem; font-weight:800; color:#2563eb; margin-top:1rem; }
.per-hour { font-size:0.8125rem; color:#64748b; }
.bio-text { color:#475569; line-height:1.6; font-size:0.9375rem; }
.badge-md { font-size:0.875rem; padding:0.375rem 0.875rem; }
.badge-green { background:#ecfdf5; color:#059669; }
.muted-text { color:#94a3b8; font-size:0.875rem; }
.review-row { border-bottom:1px solid #f1f5f9; padding-bottom:1rem; }
.review-author { font-weight:600; font-size:0.9375rem; color:#1e293b; }
.review-text { color:#475569; font-size:0.875rem; }
.review-date { font-size:0.75rem; color:#94a3b8; margin-top:0.25rem; }
.review-star { font-size:0.875rem; margin-left:0.125rem; }
.spinner { border: 3px solid rgba(0,0,0,0.08); border-top-color: #2563eb; border-radius:50%; width:28px; height:28px; animation: spin 1s linear infinite; }
.spinner-lg { width:36px; height:36px; }

@keyframes spin { to { transform: rotate(360deg); } }

.rating-value { font-size:0.875rem; font-weight:600; color:#1e293b; margin-left:0.25rem; }
.rating-count { font-size:0.8125rem; color:#94a3b8; }
.profile-info-section { border-top:1px solid #e2e8f0; margin-top:1.25rem; padding-top:1.25rem; text-align:left; }

@media (max-width: 767px) {
  .worker-avatar-lg { width:72px; height:72px; }
  .avatar-initials-lg { font-size:1.5rem; }
  .worker-rate { font-size:1.25rem; }
}
</style>
