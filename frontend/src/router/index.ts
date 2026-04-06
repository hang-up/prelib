import { createRouter, createWebHistory } from "vue-router";

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
    },
    {
      path: "/tasks",
      name: "tasks",
      component: TasksView,
    },
  ],
});

export default router;
