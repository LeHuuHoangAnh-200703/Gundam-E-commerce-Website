import { createRouter, createWebHistory } from 'vue-router'

import Homepage from '@/views/client/Homepage.vue';
const routes = [
    {
        path: '/',
        name: 'Homepage',
        component: Homepage
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router