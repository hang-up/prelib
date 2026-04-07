import { createRouter, createWebHistory } from "vue-router";

import { ensureAuthBootstrapped, useAuth } from "../composables/useAuth";
import LoginView from "../views/LoginView.vue";
import TasksView from "../views/TasksView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/tasks",
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: {
        guestOnly: true,
      },
    },
    {
      path: "/tasks",
      name: "tasks",
      component: TasksView,
      meta: {
        requiresAuth: true,
      },
    },
  ],
});

router.beforeEach(async (to) => {
  await ensureAuthBootstrapped();
  const { isAuthenticated } = useAuth();

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return {
      name: "login",
      query: {
        redirect: to.fullPath,
      },
    };
  }

  if (to.meta.guestOnly && isAuthenticated.value) {
    const redirect =
      typeof to.query.redirect === "string" &&
      to.query.redirect.startsWith("/")
        ? to.query.redirect
        : "/tasks";

    return redirect;
  }

  return true;
});

export default router;
