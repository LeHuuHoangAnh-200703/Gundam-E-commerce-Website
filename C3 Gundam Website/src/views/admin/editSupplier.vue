<script setup>
import { ref, onMounted } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import NotificationAdmin from "@/components/Notification/NotificationAdmin.vue";
import axios from 'axios';
import { useRouter } from 'vue-router';
const router = useRouter();

// Hàm mã hóa đầu vào
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};
const TenAdmin = localStorage.getItem("TenAdmin");
const ThoiGian = new Date();
const errors = ref({});
const formData = ref({
    idSupplier: '',
    nameSupplier: '',
    phone: '',
    address: '',
});

const notification = ref({
    message: '',
    type: ''
});
const showNotification = (msg, type) => {
    notification.value = { message: msg, type: type };
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
};

const fectchSupplier = async (maNCC) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/nhacungcap/${maNCC}`);
        formData.value.idSupplier = response.data.MaNhaCungCap;
        formData.value.nameSupplier = response.data.TenNhaCungCap;
        formData.value.phone = response.data.DienThoai;
        formData.value.address = response.data.DiaChi;
        console.log(response)
    } catch (err) {
        console.error('Error fetching data:', err);
    }
}

const editSupplier = async () => {
    errors.value = {};
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

    if (!formData.value.nameSupplier) {
        errors.value.nameSupplier = "Tên nhà cung cấp không để trống khi thêm!";
    } else {
        formData.value.nameSupplier = escapeHtml(formData.value.nameSupplier);
    }

    if (!formData.value.phone) {
        errors.value.phone = "Số điện thoại không để trống khi thêm tài khoản!";
    } else if (!phoneRegex.test(formData.value.phone)) {
        errors.value.phone = "Số điện thoại không đúng định dạng!";
    } else if (formData.value.phone.length !== 10) {
        errors.value.phone = "Số điện thoại phải có 10 ký tự!";
    }

    if (!formData.value.address) {
        errors.value.address = "Địa chỉ không để trống khi thêm tài khoản!";
    } else {
        formData.value.address = escapeHtml(formData.value.address);
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        const dataToSend = {
            TenNhaCungCap: formData.value.nameSupplier,
            DienThoai: formData.value.phone,
            DiaChi: formData.value.address,
        };

        const response = await axios.put(`http://localhost:3000/api/nhacungcap/${formData.value.idSupplier}`, dataToSend);
        const notificationData = {
            ThongBao: `Nhà cung cấp ${formData.value.nameSupplier} vừa được cập nhật thông tin.`,
            NguoiChinhSua: TenAdmin,
            ThoiGian: ThoiGian,
        };

        await axios.post('http://localhost:3000/api/thongbao', notificationData);

        showNotification("Cập nhật thông tin thành công!", "success");
        setTimeout(() => {
            router.push('/admin/listSuppliers');
        }, 3000);
    } catch (err) {
        showNotification(err.response?.data?.message || "Chỉnh sửa thất bại!", "error");
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

onMounted(() => {
    const maNCC = router.currentRoute.value.params.maNCC;
    fectchSupplier(maNCC);
}); 
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="w-full relative flex flex-col gap-4 overflow-auto max-h-[calc(100vh-100px)] pb-7">
                    <div class="flex lg:flex-row flex-col gap-4 justify-center items-center">
                        <h1 class="font-bold text-[20px] uppercase">Chỉnh sửa nhà cung cấp</h1>
                    </div>
                    <div class="bg-white rounded-lg shadow-lg w-full lg:w-[70%] mx-auto p-4">
                        <form @submit.prevent="editSupplier" method="POST">
                            <div class="w-full flex flex-col lg:flex-row gap-8">
                                <div class="w-full flex flex-col gap-4">
                                    <div class="flex flex-col gap-2">
                                        <label for="nameSupplier" class="text-[15px] font-semibold">Tên nhà cung
                                            cấp</label>
                                        <input type="text" v-model="formData.nameSupplier" id="nameSupplier"
                                            class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="Nhập tên nhà cung cấp ...">
                                        <p v-if="errors.nameSupplier" class="text-red-500 text-sm mt-2">{{
                                            errors.nameSupplier }}</p>
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label for="phoneSupplier" class="text-[15px] font-semibold">Số điện
                                            thoại</label>
                                        <input type="text" v-model="formData.phone" id="phoneSupplier"
                                            class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="Nhập số điện thoại ...">
                                        <p v-if="errors.nameSupplier" class="text-red-500 text-sm mt-2">{{
                                            errors.nameSupplier }}</p>
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label for="addressSupplier" class="text-[15px] font-semibold">Địa chỉ</label>
                                        <input type="text" v-model="formData.address" id="addressSupplier"
                                            class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="Nhập địa chỉ ...">
                                        <p v-if="errors.nameSupplier" class="text-red-500 text-sm mt-2">{{
                                            errors.nameSupplier }}</p>
                                    </div>
                                    <div class="flex justify-center lg:justify-end">
                                        <button type="submit"
                                            class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] transition-all duration-300 hover:bg-[#003171]">Chỉnh
                                            sửa
                                            nhà cung cấp</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <NotificationAdmin :message="notification.message" :type="notification.type" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.active-link {
    background: #DB3F4C;
    color: white;
}
</style>