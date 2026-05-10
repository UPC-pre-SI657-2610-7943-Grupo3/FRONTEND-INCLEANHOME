<template>
  <div>
    <!-- Header -->
    <div class="search-header">
      <h1 class="page-title">{{ t('search.title') }}</h1>
      <p class="page-subtitle">{{ t('search.subtitle') }}</p>
    </div>

    <div class="flex gap-6">
      <!-- Filters sidebar -->
      <div class="filters-sidebar hidden lg:block">
        <div class="card sticky top-24">
          <div class="flex items-center justify-between mb-4">
            <h3 class="filters-title">{{ t('search.filters') }}</h3>
            <button @click="clearFilters" class="link-btn">{{ t('search.clearFilters') }}</button>
          </div>
          <div class="flex flex-col gap-4">
            <div>
              <label class="label">{{ t('search.serviceType') }}</label>
              <select v-model="filters.serviceType" class="input-field" @change="doSearch">
                <option value="">{{ t('search.allServices') }}</option>
                <option v-for="s in serviceOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
            </div>
            <div>
              <label class="label">{{ t('search.zone') }}</label>
              <select v-model="filters.zone" class="input-field" @change="doSearch">
                <option value="">{{ t('search.allZones') }}</option>
                <option v-for="z in zoneOptions" :key="z.value" :value="z.value">{{ z.label }}</option>
              </select>
            </div>
            <div>
              <label class="label">{{ t('search.gender') }}</label>
              <select v-model="filters.gender" class="input-field" @change="doSearch">
                <option value="">{{ t('search.allGenders') }}</option>
                <option value="female">{{ t('worker.female') }}</option>
                <option value="male">{{ t('worker.male') }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="label">{{ t('search.minAge') }}</label>
                <input v-model.number="filters.minAge" type="number" class="input-field" min="18" max="70" @input="doSearch" />
              </div>
              <div>
                <label class="label">{{ t('search.maxAge') }}</label>
                <input v-model.number="filters.maxAge" type="number" class="input-field" min="18" max="70" @input="doSearch" />
              </div>
            </div>
            <div>
              <label class="label">{{ t('search.maxHourlyRate') }}</label>
              <input v-model.number="filters.maxHourlyRate" type="number" class="input-field" min="10" step="5" @input="doSearch" />
            </div>
            <div>
              <label class="label">{{ t('search.minRating') }}</label>
              <select v-model.number="filters.minRating" class="input-field" @change="doSearch">
                <option value="">-</option>
                <option value="4.5">4.5+</option>
                <option value="4">4+</option>
                <option value="3">3+</option>
              </select>
            </div>
          </div>
        </div>
      </div>

         <!-- Results -->
      <div class="flex-1">
        <!-- Mobile filters toggle -->
        <div class="lg:hidden mb-4">
          <button @click="showFilters = !showFilters" class="btn btn-secondary w-full">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            {{ t('search.filters') }}
          </button>
          <div v-if="showFilters" class="card mt-3">
            <!-- mobile filters -->
            <div class="flex flex-col gap-3">
              <select v-model="filters.serviceType" class="input-field" @change="doSearch"><option value="">{{ t('search.allServices') }}</option><option v-for="s in serviceOptions" :key="s.value" :value="s.value">{{ s.label }}</option></select>
              <select v-model="filters.zone" class="input-field" @change="doSearch"><option value="">{{ t('search.allZones') }}</option><option v-for="z in zoneOptions" :key="z.value" :value="z.value">{{ z.label }}</option></select>
              <select v-model="filters.gender" class="input-field" @change="doSearch"><option value="">{{ t('search.allGenders') }}</option><option value="female">{{ t('worker.female') }}</option><option value="male">{{ t('worker.male') }}</option></select>
            </div>
          </div>
        </div>

         <div class="flex items-center justify-between mb-4">
          <p class="results-meta"><span class="results-count">{{ workers.length }}</span> {{ t('search.results') }}</p>
        </div>

        <div v-if="loading" class="flex justify-center py-16">
          <div class="spinner spinner-lg"></div>
        </div>

        <div v-else-if="workers.length === 0" class="text-center py-16 empty-state">
          <div class="empty-illustration">🔍</div>
          <p class="empty-text">{{ t('search.noResults') }}</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <WorkerCard v-for="worker in workers" :key="worker.id" :worker="worker" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import api from "../../Shared/api.js";
import WorkerCard from "../components/WorkerCard.vue";

const { t } = useI18n();
const workers = ref([]);
const loading = ref(true);
const showFilters = ref(false);
const filters = ref({ serviceType: "", zone: "", gender: "", minAge: "", maxAge: "", maxHourlyRate: "", minRating: "" });

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

async function doSearch() {
  loading.value = true;
  try {
    const params = {};
    Object.entries(filters.value).forEach(([k, v]) => { if (v !== "" && v !== null) params[k] = v; });
    const { data } = await api.get("/workers", { params });
    workers.value = data;
  } catch { workers.value = []; }
  finally { loading.value = false; }
}

function clearFilters() {
  filters.value = { serviceType: "", zone: "", gender: "", minAge: "", maxAge: "", maxHourlyRate: "", minRating: "" };
  doSearch();
}

onMounted(doSearch);
</script>

<style scoped>
.search-header { margin-bottom: 1.5rem; }
.page-title { font-size:1.5rem; font-weight:800; color:#0f172a; margin:0; }
.page-subtitle { color:#64748b; margin-top:0.25rem; }
.filters-sidebar { width:260px; flex-shrink:0; }
.filters-title { font-weight:600; color:#1e293b; }
.link-btn { font-size:0.8125rem; color:#2563eb; background:none; border:none; cursor:pointer; }
.results-meta { font-size:0.9375rem; color:#64748b; }
.results-count { font-weight:600; color:#1e293b; margin-right:0.25rem; }
.spinner { border: 3px solid rgba(0,0,0,0.08); border-top-color: #2563eb; border-radius:50%; width:28px; height:28px; animation: spin 1s linear infinite; }
.spinner-lg { width:36px; height:36px; }
.empty-state .empty-illustration { font-size:3rem; margin-bottom:1rem; }
.empty-text { color:#64748b; }

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 767px) {
  .filters-sidebar { display: none !important; }
  .search-header { padding: 0 0.5rem; }
}
</style>
