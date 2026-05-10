<template>
  <div class="layout-wrapper">
    <nav class="top-nav">
      <div class="nav-container">
        <div class="nav-content">
          
          <router-link to="/client/search" class="brand-link">
            <div class="logo-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span class="brand-text">InClean<span class="brand-accent">Home</span></span>
          </router-link>
          
          <div class="nav-menu">
            <router-link v-for="link in navLinks" :key="link.to" :to="link.to"
              class="nav-item"
              :class="{ 'active': $route.path.startsWith(link.to) }">
              <span v-html="link.icon" class="nav-icon"></span>
              <span class="nav-label">{{ t(link.label) }}</span>
            </router-link>
            
            <div class="nav-divider"></div>
            
            <button @click="handleLogout" class="nav-item nav-logout">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span class="nav-label">{{ t('nav.logout') }}</span>
            </button>
            
            <button @click="toggleLang" class="nav-item lang-btn">
              {{ locale === 'es' ? 'EN' : 'ES' }}
            </button>
          </div>
          
        </div>
      </div>
    </nav>
    
    <main class="main-container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import { useRoute } from "vue-router";

const { t, locale } = useI18n();
const router = useRouter();
const auth = useAuthStore();
const route = useRoute();

const navLinks = [
  { to: "/client/search", label: "nav.search", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' },
  { to: "/client/bookings", label: "nav.bookings", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
  { to: "/client/payments", label: "nav.payments", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>' },
  { to: "/client/messages", label: "nav.messages", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>' },
  { to: "/client/profile", label: "nav.profile", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' }
];

function handleLogout() {
  auth.clearAuth();
  router.push("/");
}

function toggleLang() {
  locale.value = locale.value === "es" ? "en" : "es";
  localStorage.setItem("inclean_lang", locale.value);
}
</script>

<style scoped>
.layout-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg);
  position: relative;
}

.top-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(24px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  width: 100%;
  transition: all 0.3s;
}

.nav-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 1rem 1rem;
}

@media (min-width: 670px) {
  .nav-container { padding: 1rem 1.5rem; }
}
@media (min-width: 1300px) {
  .nav-container { padding: 1rem 2rem; }
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: transform 0.3s;
  flex-shrink: 0;
}
.brand-link:hover { transform: scale(1.05); }
.brand-link:active { transform: scale(0.95); }

.logo-box {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

.brand-text {
  font-weight: 800;
  font-size: 1.5rem;
  color: #0f172a;
  letter-spacing: -0.025em;
  display: none;
}
@media (min-width: 830px) {
  .brand-text { display: block; }
}
.brand-accent { color: var(--color-primary); }

.nav-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: flex-end;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  padding: 0.5rem 0.5rem;
  margin: -0.5rem -0.5rem;
}
.nav-menu::-webkit-scrollbar { display: none; }
@media (min-width: 670px) {
  .nav-menu { gap: 0.75rem; }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #475569;
  transition: all 0.3s ease;
  white-space: nowrap;
}
@media (min-width: 670px) {
  .nav-item { padding: 0.75rem 1.25rem; font-size: 1rem; }
}

.nav-icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-icon :deep(svg) { width: 1.5rem; height: 1.5rem; }

.nav-label { display: none; }
@media (min-width: 1300px) {
  .nav-label { display: inline; }
}

.nav-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  background-color: #f8fafc;
  color: var(--color-primary);
}
.nav-item:active { transform: translateY(0) scale(0.95); }

.nav-item.active {
  background-color: #eff6ff;
  color: #1d4ed8;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
  border: 1px solid rgba(191,219,254,0.5);
}

.nav-divider {
  width: 1px;
  height: 2.5rem;
  background-color: #e2e8f0;
  margin: 0 0.5rem;
  display: none;
}
@media (min-width: 670px) {
  .nav-divider { display: block; }
}

.nav-logout:hover {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid rgba(254,202,202,0.5);
}

.lang-btn {
  margin-left: 0.25rem;
  padding: 0.625rem 1rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
}
@media (min-width: 670px) {
  .lang-btn { padding: 0.75rem 1.25rem; }
}
.lang-btn:hover { background-color: white; }

.main-container {
  flex: 1;
  max-width: 1300px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1rem;
}
@media (min-width: 670px) {
  .main-container { padding: 3rem 1.5rem; }
}
@media (min-width: 1300px) {
  .main-container { padding: 3rem 2rem; }
}
</style>
