import { createRouter, createWebHistory } from 'vue-router'

import Homepage from '@/views/client/Homepage.vue';
import Login from '@/views/auth/Login.vue';
import Register from '@/views/auth/Register.vue';
import Details from '@/views/client/Details.vue';
import Orders from '@/views/client/Orders.vue';
import Carts from '@/views/client/Cart.vue';
import Orders_History from '@/views/client/Orders_History.vue';
import Profile from '@/views/client/Profile.vue';
import EditProfile from '@/views/client/EditProfile.vue';
import Feedback from '@/views/client/Feedback.vue';
const routes = [
    {
        path: '/',
        name: 'Homepage',
        component: Homepage
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
    {
        path: '/details',
        name: 'Details',
        component: Details
    },
    {
        path: '/orders',
        name: 'Orders',
        component: Orders
    },
    {
        path: '/carts',
        name: 'Carts',
        component: Carts
    },
    {
        path: '/orders_history',
        name: 'Orders_History',
        component: Orders_History
    },
    {
        path: '/profile',
        name: 'Profile',
        component: Profile
    },
    {
        path: '/editProfile',
        name: 'Edit Profile',
        component: EditProfile
    },
    {
        path: '/feedback',
        name: 'Feedback',
        component: Feedback
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router