import { createRouter, createWebHistory } from "vue-router";
import GamePage from "../pages/GamePage.vue";
import LandingPage from "../pages/LandingPage.vue";
const routes = [
  {
    path: "/",
    name: "LandingPage",
    component: LandingPage,
  },
  {
    path: "/game",
    name: "GamePage",
    component: GamePage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
