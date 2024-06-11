import { createRouter, createWebHistory } from "vue-router";
import GamePage from "../pages/GamePage.vue";

const routes = [
  {
    path: "/",
    name: "GamePage",
    component: GamePage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
