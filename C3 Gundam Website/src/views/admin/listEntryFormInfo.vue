<script setup>
import { onMounted, ref } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import NotificationAdmin from "@/components/Notification/NotificationAdmin.vue";
import axios from "axios";
import { useRouter } from 'vue-router';
import * as XLSX from 'xlsx';

const router = useRouter();

const TenAdmin = localStorage.getItem("TenAdmin");
const ThoiGian = new Date();

const listProducts = ref([]);
const errors = ref({});
const idEntryForm = ref('');
const idSupplier = ref('');
const timeEntryForm = ref('');
const listEntryFormInfos = ref([]);
const formData = ref({
    idProduct: '',
    nameProduct: '',
    price: '',
    quantity: '',
    totalPrice: '',
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

const fetchEntryForm = async (idPhieuNhap) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/phieunhap/${idPhieuNhap}`);
        idEntryForm.value = response.data.MaPhieuNhap;
        idSupplier.value = response.data.MaNhaCungCap;
        timeEntryForm.value = new Date(response.data.NgayNhap);
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const fetchProducts = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/sanpham');
        listProducts.value = response.data.filter(product => product.MaNhaCungCap === idSupplier.value
            && product.TrangThai !== 'Ngừng kinh doanh'
        );
    } catch (err) {
        console.log("Erro fetching: ", err);
    }
}

const addEntryFormInfo = async () => {
    errors.value = {};

    if (!formData.value.idProduct) {
        errors.value.idProduct = "Sản phẩm không được trống.";
    }

    if (!formData.value.price) {
        errors.value.price = "Giá nhập không được trống."
    } else if (formData.value.price < 0) {
        errors.value.price = "Trường này không được phép âm."
    }

    if (!formData.value.quantity) {
        errors.value.quantity = "Số lượng không được trống."
    } else if (formData.value.quantity < 0) {
        errors.value.quantity = "Trường này không được âm."
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        const nameProduct = listProducts.value.find(product => {
            return product.MaSanPham === formData.value.idProduct;
        });

        formData.value.nameProduct = nameProduct.TenSanPham;

        const dataToSend = {
            MaPhieuNhap: idEntryForm.value,
            MaSanPham: formData.value.idProduct,
            TenSanPham: formData.value.nameProduct,
            GiaNhap: formData.value.price,
            SoLuong: formData.value.quantity,
            TongTien: formData.value.quantity * formData.value.price,
            NgayNhap: ThoiGian,
        }

        const response = await axios.post('http://localhost:3000/api/chitietphieunhap', dataToSend);
        const confirmUpdate = confirm("Vui lòng kiểm tra lại thông tin trước khi thêm?");
        if (!confirmUpdate) return;
        const notificationData = {
            ThongBao: `Chi tiết phiếu nhập ${idEntryForm.value} vừa được thêm.`,
            NguoiChinhSua: TenAdmin,
            ThoiGian: ThoiGian,
        };

        await axios.post('http://localhost:3000/api/thongbao', notificationData);

        showNotification("Thêm chi tiết phiếu nhập thành công!", "success");
        fetchEntryFormInfos();
        fetchProducts();
    } catch (error) {
        showNotification(error.response?.data?.message || "Thêm chi tiết phiếu nhập thất bại!", "error");
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

const fetchEntryFormInfos = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/chitietphieunhap');
        listEntryFormInfos.value = response.data
            .filter(entryFormInfo => entryFormInfo.MaPhieuNhap === idEntryForm.value)
            .map(entryFormInfo => {
                return {
                    ...entryFormInfo,
                    NgayNhap: new Date(entryFormInfo.NgayNhap)
                };
            });
        listEntryFormInfos.value.sort((a, b) => b.NgayNhap - a.NgayNhap);
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const exportToExcel = async (maPN) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/chitietphieunhap/phieunhap/${maPN}`);
        const data = response.data;

        if (!Array.isArray(data) || data.length === 0) {
            showNotification('Không có dữ liệu để xuất!', 'error');
            return;
        }

        // Chuyển đổi định dạng ngày và định dạng đơn giá
        const formattedData = data.map(item => {
            return {
                'Mã Phiếu Nhập': item.MaPhieuNhap,
                'Mã Sản Phẩm': item.MaSanPham,
                'Tên Sản Phẩm': item.TenSanPham,
                'Số Lượng': item.SoLuong,
                'Giá Nhập': formatCurrency(item.GiaNhap),
                'Tổng Tiền': formatCurrency(item.TongTien),
                'Ngày Nhập': new Date(item.NgayNhap).toLocaleDateString('vi-VN')
            };
        });

        // Tạo workbook và worksheet
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Hóa Đơn');

        // Tùy chỉnh tiêu đề cột
        worksheet['!cols'] = [
            { wch: 15 }, // Mã Phiếu Nhập
            { wch: 15 }, // Mã Sản Phẩm
            { wch: 30 }, // Tên Sản Phẩm
            { wch: 10 }, // Số Lượng
            { wch: 15 }, // Giá Nhập
            { wch: 15 }, // Tổng Tiền
            { wch: 15 }  // Ngày Nhập
        ];
        // Xuất file Excel
        XLSX.writeFile(workbook, `Phiếu nhập kho_${maPN}.xlsx`);
        showNotification('Xuất phiếu nhập thành công!', 'success');
    } catch (error) {
        console.error('Lỗi khi xuất Excel:', error.message);
        showNotification('Có lỗi xảy ra khi xuất Excel!', 'error');
    }
};

const formatDate = (date) => {
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' };
    const formattedDate = date.toLocaleString('vi-VN', options);

    const [time, day] = formattedDate.split(', ');
    return `${time}`;
};

function formatCurrency(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

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
    const idPN = router.currentRoute.value.params.maPN;
    fetchEntryForm(idPN);
    fetchProducts();
    fetchEntryFormInfos();
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
                        <h1 class="font-bold text-[20px] uppercase">Quản lý chi tiết phiếu nhập</h1>
                    </div>
                    <div class="bg-white rounded-lg shadow-lg w-full lg:w-[70%] mx-auto p-4">
                        <form @submit.prevent="addEntryFormInfo" method="POST">
                            <div class="w-full flex flex-col lg:flex-row gap-8">
                                <div class="w-full flex flex-col gap-4">
                                    <div class="flex flex-col gap-2">
                                        <label for="idEntryForm" class="text-[15px] font-semibold">Mã phiếu nhập</label>
                                        <input type="text" id="idEntryForm" v-model="idEntryForm" readonly
                                            class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="Nhập mã phiếu nhập ...">
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label for="brandProduct" class="text-[15px] font-semibold">Mã sản phẩm</label>
                                        <select v-model="formData.idProduct"
                                            class="p-2 border-2 cursor-pointer text-[#003171] rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            name="" id="brandProduct">
                                            <option value="" class="text-[#003171] font-semibold">Chọn sản phẩm phù hợp
                                            </option>
                                            <option v-for="(product, index) in listProducts" :key="index"
                                                :value="product.MaSanPham" class="text-[#003171] font-semibold">{{
                                                    product.MaSanPham }} -
                                                {{ product.TenSanPham }} - {{ formatCurrency(product.GiaBan) }} VNĐ -
                                                Còn lại: {{ product.SoLuong }}
                                            </option>
                                        </select>
                                        <p v-if="errors.idProduct" class="text-red-500 text-sm mt-2">{{
                                            errors.idProduct }}</p>
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label for="price" class="text-[15px] font-semibold">Giá nhập</label>
                                        <input type="number" id="price" v-model="formData.price"
                                            class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="Nhập giá nhập sản phẩm ...">
                                        <p v-if="errors.price" class="text-red-500 text-sm mt-2">{{
                                            errors.price }}</p>
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label for="quantity" class="text-[15px] font-semibold">Số lượng</label>
                                        <input type="number" id="quantity" v-model="formData.quantity"
                                            class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="Nhập Số lượng ...">
                                        <p v-if="errors.quantity" class="text-red-500 text-sm mt-2">{{
                                            errors.quantity }}</p>
                                    </div>
                                    <div class="flex justify-center lg:justify-end">
                                        <button type="submit" :class="isSameDay(timeEntryForm) ? 'block' : 'hidden'"
                                            class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] transition-all duration-300 hover:bg-[#003171]">Thêm
                                            chi tiết
                                            phiếu nhập</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="flex justify-end">
                        <button @click="exportToExcel(idEntryForm)"
                            class="bg-[#003171] text-white font-semibold py-3 px-5 rounded-md text-[14px]"><i
                                class="fa-solid fa-plus mr-2"></i> Xuất phiếu nhập</button>
                    </div>
                    <div class="shadow-lg rounded-lg border-2 border-gray-300">
                        <div class="w-full overflow-x-auto">
                            <table class="w-full bg-white whitespace-nowrap text-center text-gray-500 overflow-auto">
                                <thead class="bg-[#1A1D27] text-white">
                                    <tr>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã phiếu nhập</th>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã sản phẩm</th>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tên sản phẩm</th>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Số lượng</th>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Giá nhập</th>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tổng tiền</th>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Ngày Nhập</th>
                                    </tr>
                                </thead>
                                <tbody class="w-full">
                                    <tr class="border-t border-slate-500"
                                        v-for="(entryFormInfo, index) in listEntryFormInfos" :key="index">
                                        <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{
                                            entryFormInfo.MaPhieuNhap }}</td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                            {{ entryFormInfo.MaSanPham }}</td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                            <p class="overflow-hidden text-ellipsis whitespace-nowrap">{{
                                                entryFormInfo.TenSanPham }}</p>
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                            {{ entryFormInfo.SoLuong }}</td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                            {{ formatCurrency(entryFormInfo.GiaNhap) }} VNĐ</td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                            {{ formatCurrency(entryFormInfo.TongTien) }} VNĐ</td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                            {{ formatDate(entryFormInfo.NgayNhap) }}</td>
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