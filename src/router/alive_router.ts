import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "mmd",
        component: import("../components/mmd/MMD.vue")
    },
    {
        path: "/live2d",
        name: "live2d",
        component: import("../components/live2d/Live2d.vue")
    },
]

const router = createRouter(
    {
        history: createWebHistory(),
        routes
    }
);

export default router;