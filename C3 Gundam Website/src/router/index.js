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
import listFeedBacks from '@/views/admin/listFeedBacks.vue';
import listOrders from '@/views/admin/listOrders.vue';
import staffList from '@/views/admin/staffLists.vue';
import editStaff from '@/views/admin/editStaff.vue';
import customers from '@/views/admin/customers.vue';
import listSuppliers from '@/views/admin/listSuppliers.vue';
import editSupplier from '@/views/admin/editSupplier.vue';
import listBills from '@/views/admin/listBills.vue';
import editBill from '@/views/admin/editBill.vue';
import listBillInfo from '@/views/admin/listBillInfo.vue';

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
    {
        path: '/admin/listFeedBacks',
        name: 'List FeedBacks',
        component: listFeedBacks
    },
    {
        path: '/admin/listOrders',
        name: 'List Orders',
        component: listOrders
    },
    {
        path: '/admin/staffList',
        name: 'Staff List',
        component: staffList
    },
    {
        path: '/admin/editStaff',
        name: 'Edit Staff',
        component: editStaff
    },
    {
        path: '/admin/customers',
        name: 'Customers',
        component: customers
    },
    {
        path: '/admin/listSuppliers',
        name: 'List Suppliers',
        component: listSuppliers
    },
    {
        path: '/admin/editSupplier',
        name: 'Edit Supplier',
        component: editSupplier
    },
    {
        path: '/admin/listBills',
        name: 'List Bills',
        component: listBills
    },
    {
        path: '/admin/editBill',
        name: 'Edit Bill',
        component: editBill
    },
    {
        path: '/admin/listBillInfo',
        name: 'List Bill Info',
        component: listBillInfo
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router