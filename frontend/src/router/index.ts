import { createRouter, createWebHistory } from "vue-router";
import Beranda from "../views/beranda.vue";

const routes = [
    {path: "/", name: "Beranda", component: Beranda},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;