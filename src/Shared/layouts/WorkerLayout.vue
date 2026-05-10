<template>
  <div class="min-h-screen flex flex-col layout-bg">
    <nav class="top-nav sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <router-link to="/worker/dashboard" class="flex items-center gap-2">
          <div class="logo-tiny logo-tiny-worker">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span class="brand logo-brand">InClean<span class="brand-accent-worker">Home</span></span>
        </router-link>
        <div class="flex items-center gap-1">
          <router-link v-for="link in navLinks" :key="link.to" :to="link.to"
            class="nav-link px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5"
            :class="[$route.path.startsWith(link.to) ? 'nav-active-w' : 'nav-inactive']">
            <span v-html="link.icon"></span>
            <span class="hidden sm:inline">{{ t(link.label) }}</span>
          </router-link>
          <button @click="handleLogout" class="nav-link nav-inactive px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span class="hidden sm:inline">{{ t('nav.logout') }}</span>
          </button>
          <button @click="toggleLang" class="ml-2 px-2 py-1 rounded text-xs font-semibold lang-toggle">
            {{ locale === 'es' ? 'EN' : 'ES' }}
          </button>
        </div>
      </div>
    </nav>
    <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

function toggleLang() { locale.value = locale.value === "es" ? "en" : "es"; }
function handleLogout() { auth.clearAuth(); router.push("/login"); }

const navLinks = [
  { to: "/worker/dashboard", label: "nav.dashboard", icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
  { to: "/worker/availability", label: "nav.availability", icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
  { to: "/worker/requests", label: "nav.requests", icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>' },
  { to: "/worker/reviews", label: "nav.reviews", icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
  { to: "/worker/messages", label: "nav.messages", icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>' },
  { to: "/worker/profile", label: "nav.profile", icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
];
</script>

<style scoped>
.nav-active-w { background: #ede9fe; color: #7c3aed; }
.nav-inactive { color: #64748b; }
.nav-inactive:hover { background: #f8fafc; color: #1e293b; }
.layout-bg { background:#f8fafc; }
.top-nav { background:white; border-bottom:1px solid #e2e8f0; }
.logo-tiny { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; }
.logo-tiny-worker { background: linear-gradient(135deg,#8b5cf6,#06b6d4); }
.brand { font-weight:700; font-size:1.125rem; color:#1e293b; }
.brand-accent-worker { color:#8b5cf6; }
.lang-toggle { background:#f1f5f9; color:#475569; border:1px solid #e2e8f0; }
</style>
