import { createRouter, createWebHistory } from "vue-router";
import { ref } from "vue";
import Homepage from "@/views/client/Homepage.vue";
import Login from "@/views/auth/Login.vue";
import Register from "@/views/auth/Register.vue";
import Details from "@/views/client/Details.vue";
import Orders from "@/views/client/Orders.vue";
import Carts from "@/views/client/Cart.vue";
import Orders_History from "@/views/client/Orders_History.vue";
import Profile from "@/views/client/Profile.vue";
import EditProfile from "@/views/client/EditProfile.vue";
import Feedback from "@/views/client/Feedback.vue";
import adminLogin from "@/views/auth/adminLogin.vue";
import addAdmin from "@/views/auth/addAdmin.vue";
import adminProducts from "@/views/admin/adminProducts.vue";
import addProduct from "@/views/admin/addProduct.vue";
import editProduct from "@/views/admin/editProduct.vue";
import listFeedBacks from "@/views/admin/listFeedBacks.vue";
import listOrders from "@/views/admin/listOrders.vue";
import staffList from "@/views/admin/staffLists.vue";
import editStaff from "@/views/admin/editStaff.vue";
import customers from "@/views/admin/customers.vue";
import listSuppliers from "@/views/admin/listSuppliers.vue";
import addSupplier from "@/views/admin/addSupplier.vue";
import editSupplier from "@/views/admin/editSupplier.vue";
import listEntryForms from "@/views/admin/listEntryForms.vue";
import editEntryForm from "@/views/admin/editEntryForm.vue";
import inventory from "@/views/admin/inventory.vue";
import listEntryFormInfo from "@/views/admin/listEntryFormInfo.vue";
import discountCode from "@/views/admin/discountCode.vue";
import addDiscountCode from "@/views/admin/addDiscountCode.vue";
import editDiscountCode from "@/views/admin/editDiscountCode.vue";
import notFound from "@/views/errors/notFound.vue";
import OrderProducts from "@/views/client/OrderProducts.vue";
import AddInfoOrder from "@/views/client/AddInfoOrder.vue";
import chatWithCustomer from "@/views/admin/chatWithCustomer.vue";
import ChatBox from "@/views/client/ChatBox.vue";
import Statistical from "@/views/admin/adminStatistical.vue";
import personalDirectory from "@/views/client/personalDirectory.vue";
import Voucher from "@/views/client/Voucher.vue";
import SearchResults from "@/views/client/SearchResults.vue";
import ChatBot from "../views/client/ChatBot.vue";
import CommunityPost from "@/views/client/communityPost.vue";
import AddCommunityPost from "@/views/client/addCommunityPost.vue";
import CommentCommunityPost from "@/views/client/commentCommunityPost.vue";
import CommunityPostManage from "@/views/admin/communityPostManage.vue";
import YourPostLists from "@/views/client/yourPostLists.vue";
import PaymentVNPaySuccess from "@/views/success/paymentVNPaySuccess.vue";
import ListProductType from "@/views/admin/listProductType.vue";
import AddProductType from "@/views/admin/addProductType.vue";
import EditProductType from "@/views/admin/editProductType.vue";

const routes = [
    {
        path: "/",
        name: "Homepage",
        component: Homepage,
    },
    {
        path: "/login",
        name: "Login",
        component: Login,
    },
    {
        path: "/register",
        name: "Register",
        component: Register,
    },
    {
        path: "/details/:maSanPham",
        name: "Details",
        component: Details,
    },
    {
        path: "/orders/:maSanPham",
        name: "Orders",
        component: Orders,
    },
    {
        path: "/orders",
        name: "Order Products",
        component: OrderProducts,
    },
    {
        path: "/carts",
        name: "Carts",
        component: Carts,
    },
    {
        path: "/orders_history",
        name: "Orders_History",
        component: Orders_History,
    },
    {
        path: "/profile",
        name: "Profile",
        component: Profile,
    },
    {
        path: "/chatbox",
        name: "Chat Box",
        component: ChatBox,
    },
    {
        path:"/personalDirectory/:maKhachHang",
        name: "Personal Directory",
        component: personalDirectory,
    },
    {
        path: "/addInfoOrder/:maKhachHang",
        name: "AddInfoOrder",
        component: AddInfoOrder,
    },
    {
        path: "/editProfile/:maKhachHang",
        name: "Edit Profile",
        component: EditProfile,
    },
    {
        path: "/feedback/:maDanhGia",
        name: "Feedback",
        component: Feedback,
    },
    {
        path: "/voucher",
        name: "Voucher",
        component: Voucher,
    },
    {
        path: "/seachResults",
        name: "Seach Results",
        component: SearchResults,
    },
    {
        path: "/chatBot",
        name: "ChatBot",
        component: ChatBot,
    },
    {
        path: "/communityPost",
        name: "Community Post",
        component: CommunityPost,
    },
    {
        path: "/addCommunityPost/:maKhachHang",
        name: "Add Community Post",
        component: AddCommunityPost,
    },
    {
        path: "/commentCommunityPost/:maBaiDang",
        name: "Comment Community Post",
        component: CommentCommunityPost,
    },
    {
        path: "/yourPostLists/:maKhachHang",
        name: "Your Post Lists",
        component: YourPostLists,
    },
    {
        path: "/admin/adminLogin",
        name: "Admin Login",
        component: adminLogin,
    },
    {
        path: "/admin/addAdmin",
        name: "Add Admin",
        component: addAdmin,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/adminProducts",
        name: "Admin Products",
        component: adminProducts,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/addProduct",
        name: "Add Product",
        component: addProduct,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/editProduct/:maSanPham",
        name: "Edit Product",
        component: editProduct,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/listFeedBacks",
        name: "List FeedBacks",
        component: listFeedBacks,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/listOrders",
        name: "List Orders",
        component: listOrders,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/staffList",
        name: "Staff List",
        component: staffList,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/editStaff/:maAdmin",
        name: "Edit Staff",
        component: editStaff,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/customers",
        name: "Customers",
        component: customers,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/listSuppliers",
        name: "List Suppliers",
        component: listSuppliers,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/addSupplier",
        name: "Add supplier",
        component: addSupplier,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/editSupplier/:maNCC",
        name: "Edit Supplier",
        component: editSupplier,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/listProductType",
        name: "List Product Type",
        component: ListProductType,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/addListProductType",
        name: "Add List Product Type",
        component: AddProductType,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/editListProductType/:maLoaiSanPham",
        name: "Edit List Product Type",
        component: EditProductType,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/inventoryLits",
        name: "Inventory Lits",
        component: inventory,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/listEntryForms",
        name: "List Entry Forms",
        component: listEntryForms,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/editEntryForm/:maPN",
        name: "Edit Entry Form",
        component: editEntryForm,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/listEntryFormInfo/:maPN",
        name: "list Entry Form Info",
        component: listEntryFormInfo,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/discountCode",
        name: "Discount Code",
        component: discountCode,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/addDiscountCode",
        name: "Add Discount Code",
        component: addDiscountCode,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/editDiscountCode/:idMaGG",
        name: "Edit Discount Code",
        component: editDiscountCode,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/chatWithCustomer",
        name: "Chat With Customer",
        component: chatWithCustomer,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/statisticals",
        name: "Admin statistical",
        component: Statistical,
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/communityPostManage",
        name: "Comunity Post Manage",
        component: CommunityPostManage,
        meta: { requiresAuth: true },
    },
    {
        path: "/notFound",
        name: "Not Found",
        component: notFound,
        meta: { requiresAuth: true },
    },
    {
        path: "/paymentVNPaySuccess",
        name: "Payment VNPay Success",
        component: PaymentVNPaySuccess,
        meta: { requiresAuth: true },
    },
    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: notFound,
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});
const isLoading = ref(false);
router.beforeEach((to, from, next) => {
    isLoading.value = true;

    // Kiểm tra xem route có yêu cầu xác thực không
    if (to.matched.some(record => record.meta.requiresAuth)) {
        // Kiểm tra trạng thái đăng nhập
        if (!localStorage.getItem("MaAdmin")) {
            next({ path: "/admin/adminLogin" }); // Chuyển hướng đến trang đăng nhập
            isLoading.value = false; // Ẩn loading nếu chuyển hướng
        } else {
            // Gọi next sau khi loading hoàn tất
            setTimeout(() => {
                isLoading.value = false;
                next(); // Cho phép truy cập
            }, 1000); // Thời gian loading 2 giây
        }
    } else {
        // Gọi next sau khi loading hoàn tất
        setTimeout(() => {
            isLoading.value = false;
            next(); // Cho phép truy cập
        }, 1000); // Thời gian loading 2 giây
    }
});

export { router, isLoading };
export default router;