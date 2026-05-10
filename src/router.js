import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "./Shared/stores/auth.js";

const routes = [
  // Public — IAM bounded context
  { path: "/", redirect: "/login" },
  { path: "/login", component: () => import("./IAM/views/LoginView.vue"), meta: { public: true } },
  { path: "/register", component: () => import("./IAM/views/RegisterView.vue"), meta: { public: true } },
  { path: "/upload-documents", component: () => import("./IAM/views/UploadDocumentsView.vue"), meta: { public: true } },

  // Client routes
  {
    path: "/client",
    component: () => import("./Shared/layouts/ClientLayout.vue"),
    meta: { requiresAuth: true, role: "client" },
    children: [
      { path: "", redirect: "/client/search" },
      // SearchAndCatalog
      { path: "search", component: () => import("./SearchAndCatalog/views/SearchView.vue") },
      { path: "worker/:id", component: () => import("./SearchAndCatalog/views/WorkerProfileView.vue") },
      // Booking
      { path: "worker/:id/book", component: () => import("./Booking/views/BookingView.vue") },
      { path: "bookings", component: () => import("./Booking/views/ClientBookingsView.vue") },
      // Payments
      { path: "payments", component: () => import("./Payments/views/PaymentMethodsView.vue") },
      // Shared — messages
      { path: "messages", component: () => import("./Shared/views/MessagesView.vue") },
      { path: "messages/:userId", component: () => import("./Shared/views/ChatView.vue") },
      // Profiles
      { path: "profile", component: () => import("./Profiles/views/ClientProfileView.vue") },
    ],
  },

  // Worker routes
  {
    path: "/worker",
    component: () => import("./Shared/layouts/WorkerLayout.vue"),
    meta: { requiresAuth: true, role: "worker" },
    children: [
      { path: "", redirect: "/worker/dashboard" },
      // Profiles
      { path: "dashboard", component: () => import("./Profiles/views/WorkerDashboardView.vue") },
      { path: "profile", component: () => import("./Profiles/views/WorkerProfileEditView.vue") },
      // Booking
      { path: "availability", component: () => import("./Booking/views/AvailabilityView.vue") },
      { path: "requests", component: () => import("./Booking/views/WorkerRequestsView.vue") },
      // ReviewsAndEvaluation
      { path: "reviews", component: () => import("./ReviewsAndEvaluation/views/MyReviewsView.vue") },
      // Shared — messages
      { path: "messages", component: () => import("./Shared/views/MessagesView.vue") },
      { path: "messages/:userId", component: () => import("./Shared/views/ChatView.vue") },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.public) {
    if (auth.isLoggedIn && to.path === "/login") {
      return auth.user?.role === "worker" ? "/worker/dashboard" : "/client/search";
    }
    return true;
  } else if (to.meta.requiresAuth) {
    if (!auth.isLoggedIn) return "/login";
    if (to.meta.role && auth.user?.role !== to.meta.role) {
      return auth.user?.role === "worker" ? "/worker/dashboard" : "/client/search";
    }
    return true;
  }
  return true;
});

export default router;
