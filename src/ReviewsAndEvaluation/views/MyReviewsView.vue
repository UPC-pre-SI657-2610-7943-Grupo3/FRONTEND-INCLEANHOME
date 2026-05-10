<template>
  <div>
    <h1 class="page-title mb-6">{{ t('profile.reviews') }}</h1>

    <div v-if="loading" class="flex justify-center py-16"><div class="spinner spinner-lg"></div></div>

    <div v-else>
      <!-- Summary card -->
      <div class="card mb-6 summary-card">
        <div class="flex items-center gap-6">
          <div class="text-center">
            <div class="avg-rating">{{ avgRating.toFixed(1) }}</div>
            <div class="flex justify-center">
              <span v-for="i in 5" :key="i" class="star-large" :style="{ color: i <= Math.round(avgRating) ? '#f59e0b' : '#e2e8f0' }">★</span>
            </div>
            <div class="summary-meta">{{ reviews.length }} {{ t('reviews.total') }}</div>
          </div>
          <div class="flex-1">
            <div v-for="n in [5,4,3,2,1]" :key="n" class="flex items-center gap-2 mb-1">
              <span class="rating-num">{{ n }}</span>
              <span class="rating-star">★</span>
              <div class="rating-bar">
                <div :style="{ width: starPercent(n) + '%' }" class="rating-bar-fill"></div>
              </div>
              <span class="rating-count">{{ starCount(n) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!reviews.length" class="text-center py-12 card empty-state">
        <div class="empty-illustration">⭐</div>
        <p class="empty-text">{{ t('profile.noReviews') }}</p>
      </div>

      <div v-else class="flex flex-col gap-4">
        <div v-for="r in reviews" :key="r.id" class="card">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="avatar-circle">
                <span class="avatar-initial">{{ (r.clientName || 'C')[0] }}</span>
              </div>
              <div>
                <div class="review-author">{{ r.clientName || 'Cliente' }}</div>
                <div class="review-date">{{ formatDate(r.createdAt) }}</div>
              </div>
            </div>
            <div class="flex">
              <span v-for="i in 5" :key="i" class="review-star" :style="{ color: i <= r.rating ? '#f59e0b' : '#e2e8f0' }">★</span>
            </div>
          </div>
          <p v-if="r.comment" class="review-comment">{{ r.comment }}</p>
        </div>
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
const reviews = ref([]);
const loading = ref(true);

const avgRating = computed(() => {
  if (!reviews.value.length) return 0;
  return reviews.value.reduce((s, r) => s + r.rating, 0) / reviews.value.length;
});

function starCount(n) { return reviews.value.filter(r => r.rating === n).length; }
function starPercent(n) { return reviews.value.length ? (starCount(n) / reviews.value.length) * 100 : 0; }
function formatDate(d) { return d ? new Date(d).toLocaleDateString("es-PE", { year:"numeric", month:"long", day:"numeric" }) : ""; }

onMounted(async () => {
  try {
    const { data } = await api.get(`/reviews/worker/${auth.user?.id}`);
    reviews.value = data;
  } catch {} finally { loading.value = false; }
});
</script>

<style scoped>
.summary-card { background: linear-gradient(135deg,#eff6ff,#f0fdf4); }
.avg-rating { font-size:3rem; font-weight:800; color:#1e293b; }
.star-large { font-size:1.25rem; color: #e2e8f0; }
.summary-meta { font-size:0.8125rem; color:#64748b; margin-top:0.25rem; }
.rating-num { font-size:0.8125rem; color:#64748b; width:12px; }
.rating-star { color:#f59e0b; font-size:0.875rem; }
.rating-bar { flex:1; height:6px; background:#e2e8f0; border-radius:9999px; overflow:hidden; }
.rating-bar-fill { height:100%; background:#f59e0b; border-radius:9999px; transition: width 0.3s ease; }
.rating-count { font-size:0.75rem; color:#94a3b8; width:28px; }
.empty-state .empty-illustration { font-size:3rem; margin-bottom:1rem; }
.empty-text { color:#64748b; }
.avatar-circle { width:40px; height:40px; border-radius:50%; background:#2563eb; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.avatar-initial { color:white; font-weight:700; font-size:0.875rem; }
.review-author { font-weight:700; color:#1e293b; }
.review-date { font-size:0.75rem; color:#94a3b8; }
.review-star { font-size:1rem; margin-left:0.125rem; color: #e2e8f0; }
.review-comment { margin-top:0.75rem; color:#475569; font-size:0.9375rem; line-height:1.6; }
.spinner { border: 3px solid rgba(0,0,0,0.08); border-top-color: #2563eb; border-radius:50%; width:28px; height:28px; animation: spin 1s linear infinite; }
.spinner-lg { width:36px; height:36px; }

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .avg-rating { font-size:2.25rem; }
  .summary-card { padding: 1rem; }
}
</style>
