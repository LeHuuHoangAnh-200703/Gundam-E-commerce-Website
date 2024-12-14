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
import adminLogin from '@/views/auth/adminLogin.vue';
import addAdmin from '@/views/auth/addAdmin.vue';
import adminProducts from '@/views/admin/adminProducts.vue';
import addProduct from '@/views/admin/addProduct.vue';
import editProduct from '@/views/admin/editProduct.vue';

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
    {
        path: '/admin/adminLogin',
        name: 'Admin Login',
        component: adminLogin
    },
    {
        path: '/admin/addAdmin',
        name: 'Add Admin',
        component: addAdmin
    },
    {
        path: '/admin/adminProducts',
        name: 'Admin Products',
        component: adminProducts
    },
    {
        path: '/admin/addProduct',
        name: 'Add Product',
        component: addProduct
    },
    {
        path: '/admin/editProduct',
        name: 'Edit Product',
        component: editProduct
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router