<script setup>
import { onMounted, ref } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import NotificationAdmin from "@/components/Notification/NotificationAdmin.vue";
import axios from "axios";
import { useRouter } from 'vue-router';

const router = useRouter();

const TenAdmin = localStorage.getItem("TenAdmin");
const MaAdmin = localStorage.getItem("MaAdmin");
const ThoiGian = new Date();

const listSuppliers = ref([]);
const listEntryForms = ref([]);
const errors = ref({});
const formData = ref({
    idSupplier: '',
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

const fetchSuppliers = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/nhacungcap');
        listSuppliers.value = response.data.map(supplier => {
            return {
                ...supplier,
            }
        })
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const addEntryForm = async () => {
    errors.value = {}

    if (!formData.value.idSupplier) {
        errors.value.idSupplier = "Nhà cung cấp không được trống.";
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        const selectedSupplier = listSuppliers.value.find(
            (supplier) => supplier.MaNhaCungCap === formData.value.idSupplier
        );

        formData.value.nameSupplier = selectedSupplier.TenNhaCungCap;
        const dataToSend = {
            MaNhaCungCap: formData.value.idSupplier,
            TenNhaCungCap: formData.value.nameSupplier,
            MaNhanVien: MaAdmin,
            TenNhanVien: TenAdmin,
            NgayNhap: ThoiGian,
        }

        const response = await axios.post('http://localhost:3000/api/phieunhap', dataToSend);
        const notificationData = {
            ThongBao: `${TenAdmin} vừa tạo phiếu nhập kho sản phẩm.`,
            NguoiChinhSua: TenAdmin,
            ThoiGian: ThoiGian,
        };

        await axios.post('http://localhost:3000/api/thongbao', notificationData);

        showNotification("Thêm phiếu nhập thành công!", "success");
        fetchEntryForm();
    } catch (err) {
        showNotification(err.response?.data?.message || "Thêm phiếu nhập thất bại!", "error");
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

const fetchEntryForm = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/phieunhap');
        listEntryForms.value = response.data.map(entryForm => {
            return {
                ...entryForm,
                NgayNhap: new Date(entryForm.NgayNhap),
            }
        });
        listEntryForms.value.sort((a, b) => b.NgayNhap - a.NgayNhap);
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const checkQuantityEntryForms = async (idPhieuNhap) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/phieunhap/kiemtra/${idPhieuNhap}`);
        if (response.data.results) {
            showNotification("Đã có thông tin nhập kho, không thể sửa!", "error");
            return;
        } else {
            router.push(`/admin/editEntryForm/${idPhieuNhap}`)
        }
    } catch (err) {
        console.log("Error fetching: ", err);
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

const formatDate = (date) => {
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' };
    const formattedDate = date.toLocaleString('vi-VN', options);

    const [time, day] = formattedDate.split(', ');
    return `${time}`;
};

const isSameDay = (date) => {
    const inputDate = new Date(date);
    const today = new Date();
    return (
        inputDate.getFullYear() === today.getFullYear() &&
        inputDate.getMonth() === today.getMonth() &&
        inputDate.getDate() === today.getDate()
    );
}

onMounted(() => {
    fetchSuppliers();
    fetchEntryForm();
})
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full h-screen font-sans flex">
        <SideBar />
        <div class="flex-1 flex flex-col h-screen overflow-hidden">
            <div class="flex-shrink-0 p-4">
                <Navbar />
            </div>
            <div class="flex-1 px-4 py-4 overflow-y-auto">
                <div class="flex flex-col gap-4">
                    <div class="flex lg:flex-row flex-col gap-4 justify-center items-center">
                        <h1 class="font-bold text-[20px] uppercase">Quản lý phiếu nhập</h1>
                    </div>
                    <div class="bg-white rounded-lg shadow-lg w-full lg:w-[70%] mx-auto p-4">
                        <form @submit.prevent="addEntryForm" method="POST">
                            <div class="w-full flex flex-col lg:flex-row gap-8">
                                <div class="w-full flex flex-col gap-4">
                                    <div class="flex flex-col gap-2">
                                        <label for="brandProduct" class="text-[15px] font-semibold">Nhà cung
                                            cấp</label>
                                        <select v-model="formData.idSupplier"
                                            class="p-2 border-2 cursor-pointer text-[#003171] rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            name="" id="brandProduct">
                                            <option value="" class="text-[#003171] font-semibold">Chọn nhà cung cấp
                                                phù hợp</option>
                                            <option v-for="(supplier, index) in listSuppliers" :key="index"
                                                :value="supplier.MaNhaCungCap" class="text-[#003171] font-semibold">{{
                                                    supplier.MaNhaCungCap }} -
                                                {{ supplier.TenNhaCungCap }}</option>
                                        </select>
                                        <p v-if="errors.idSupplier" class="text-red-500 text-sm mt-2">{{
                                            errors.idSupplier }}</p>
                                    </div>
                                    <div class="flex justify-center lg:justify-end">
                                        <button type="submit"
                                            class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] transition-all duration-300 hover:bg-[#003171]">Thêm
                                            phiếu nhập</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="shadow-lg rounded-lg border-2 border-gray-300">
                        <div class="w-full overflow-x-auto">
                            <table class="w-full bg-white whitespace-nowrap text-center text-gray-500">
                                <thead class="bg-[#1A1D27] text-white">
                                    <tr>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã phiếu nhập</th>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã nhà cung cấp</th>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tên nhà cung cấp
                                        </th>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã nhân viên</th>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tên nhân viên</th>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Ngày nhập</th>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Điều chỉnh</th>
                                    </tr>
                                </thead>
                                <tbody class="w-full">
                                    <tr class="border-t border-slate-500" v-for="(entryForm, index) in listEntryForms"
                                        :key="index">
                                        <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{
                                            entryForm.MaPhieuNhap
                                            }}</td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                            {{ entryForm.MaNhaCungCap }}</td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                            <p class="overflow-hidden text-ellipsis whitespace-nowrap">
                                                {{ entryForm.TenNhaCungCap }}</p>
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                            {{ entryForm.MaNhanVien }}</td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                            {{ entryForm.TenNhanVien }}</td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                            {{ formatDate(entryForm.NgayNhap) }}</td>
                                        <td class="flex justify-center items-center gap-2 px-7 py-7 flex-col">
                                            <button @click="checkQuantityEntryForms(entryForm.MaPhieuNhap)"
                                                class="inline-block bg-[#00697F] text-white font-medium py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#055565] whitespace-nowrap"><i
                                                    class="fa-solid fa-pen-to-square"></i></button>
                                            <router-link :to="`/admin/listEntryFormInfo/${entryForm.MaPhieuNhap}`"
                                                class="inline-block bg-[#003171] text-white font-medium py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#0c2d58] whitespace-nowrap"><i
                                                    class="fa-solid fa-hashtag"></i></router-link>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <NotificationAdmin :message="notification.message" :type="notification.type" />
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