<script setup>
import { ref, onMounted, computed } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import axios from 'axios';

const listProducts = ref([]);
const selectedType = ref('All');
const searchValue = ref('');
const TenAdmin = localStorage.getItem("TenAdmin");
const ThoiGian = new Date();
const types = ref([
    {
        name: "Tất cả",
        type: "All",
    },
    {
        name: "RG",
        type: "RG",
    },
    {
        name: "MG",
        type: "MG",
    },
    {
        name: "PG",
        type: "PG",
    },
]);

const fetchProducts = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/sanpham');
        listProducts.value = response.data.map(product => {
            return {
                ...product,
                NgayBan: new Date(product.NgayBan)
            }
        });
        listProducts.value.sort((a, b) => b.NgayBan - a.NgayBan);
    } catch (error) {
        console.error('Error fetching:', error);
    }
}

const updateStatus = async (maSanPham, newStatus) => {
    const confirmUpdate = confirm("Bạn có chắc chắn về việc cập nhật trạng thái này không?");
    if (!confirmUpdate) return;
    const nextStatus = newStatus === 'Đang bán' ? 'Ngừng kinh doanh' : 'Đang bán';
    try {
        const response = await axios.patch(`http://localhost:3000/api/sanpham/${maSanPham}`, {
            TrangThai: nextStatus,
        });

        const notificationData = {
            ThongBao: `Vừa cập nhật trạng thái ${tenSanPham}`,
            NguoiChinhSua: TenAdmin,
            ThoiGian: ThoiGian,
        };

        await axios.post('http://localhost:3000/api/thongbao', notificationData);

    } catch (error) {
        console.error('Error updating order status:', error);
    }
};

const selected = async (type) => {
    return selectedType.value = type;
}

const findProducts = computed(() => {
    return listProducts.value.filter(product => {
        const chooseType = selectedType.value === "All" || product.LoaiSanPham === selectedType.value;
        const nameProducts = !searchValue.value || product.TenSanPham.toLowerCase().includes(searchValue.value.toLowerCase());
        const idProduct = !searchValue.value || product.MaSanPham.toLowerCase().includes(searchValue.value.toLowerCase());
        return chooseType && (nameProducts || idProduct);
    })
})

function formatCurrency(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

onMounted(() => {
    fetchProducts();
})
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="w-full relative flex flex-col gap-4 max-h-[calc(100vh-120px)] pb-7">
                    <div class="flex lg:flex-row flex-col gap-4 justify-center lg:justify-between items-center">
                        <h1 class="font-bold text-[20px] uppercase">Quản lý sản phẩm</h1>
                        <div class="relative flex justify-center flex-1 gap-2 max-w-xl">
                            <input type="text" v-model="searchValue"
                                class="items-center w-full p-3 bg-white border pr-10 border-gray-400 text-[12px] font-semibold tracking-wider text-black rounded-md focus:outline-none"
                                placeholder="Tìm kiếm sản phẩm ..." />
                            <i
                                class="fa-solid fa-magnifying-glass absolute top-2 lg:top-3 right-3 text-[22px] text-[#003171]"></i>
                        </div>
                    </div>
                    <div class="flex justify-center lg:justify-end items-center flex-wrap flex-1 gap-4">
                        <button @click.prevent="selected(item.type)"
                            class="bg-white px-8 py-3 shadow font-semibold border-2 hover:border-[#003171] hover:text-[#003171] transition-all duration-300"
                            v-for="(item, index) in types" :key="index">{{ item.name }}</button>
                    </div>
                    <div class="shadow-lg border-2 border-gray-300 overflow-auto">
                        <table class="w-full bg-white whitespace-nowrap text-center text-gray-500">
                            <thead class="bg-[#1A1D27] text-white">
                                <tr>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">STT</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã sản phẩm</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Ảnh sản phẩm</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tên sản phẩm</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Đơn giá</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Loại sản phẩm</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Nhà cung cấp</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Còn lại</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Đã bán</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Trạng thái</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mô tả</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Điều chỉnh</th>
                                </tr>
                            </thead>
                            <tbody class="w-full">
                                <tr class="border-t border-slate-500" v-for="(product, index) in findProducts"
                                    :key="index">
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{ index + 1 }}
                                    </td>
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{ product.MaSanPham }}
                                    </td>
                                    <td>
                                        <img class="w-[100px] py-2 max-w-full ml-7" :src="`${product.Images[0]}`"
                                            alt="Hình ảnh sản phẩm" />
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                        <p class="overflow-hidden text-ellipsis whitespace-nowrap">{{ product.TenSanPham
                                        }}</p>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ formatCurrency(product.GiaBan) }} VNĐ</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        product.LoaiSanPham }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        product.TenNhaCungCap }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ (product.SoLuong > 0) ? product.SoLuong : 'Hết hàng' }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ (product.LuotBan) ? product.LuotBan : 0 }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        product.TrangThai }}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                        <p class="overflow-hidden text-ellipsis text-[12px] whitespace-nowrap">{{
                                            product.MoTa }}</p>
                                    </td>
                                    <td class="flex justify-center items-center gap-2 py-10">
                                        <a :href="`/admin/editProduct/${product.MaSanPham}`"
                                            class="inline-block bg-[#00697F] text-white font-medium py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#055565] whitespace-nowrap"><i
                                                class="fa-solid fa-pen-to-square"></i></a>
                                        <form @submit="updateStatus(product.MaSanPham, product.TrangThai)">
                                            <button type="submit"
                                                class="inline-block text-white font-medium bg-[#003171] py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#1c5ab2] whitespace-nowrap"><i
                                                    class="fa-solid fa-repeat"></i></button>
                                        </form>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
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