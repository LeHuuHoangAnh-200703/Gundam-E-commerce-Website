<script setup>
import { ref, onMounted, computed } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import Chat from '../../components/client/Chat.vue';
import ChatBot from '../../components/client/ChatBot.vue';
import NotificationClient from "@/components/Notification/NotificationClient.vue";
import ConfirmDialog from "@/components/Notification/ConfirmDialog.vue";
import EmtyState from '@/components/Notification/EmtyState.vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const options = [
    {
        name: "Đang chờ xác nhận",
        icon: "fa-solid fa-wallet"
    },
    {
        name: "Đang chờ lấy hàng",
        icon: "fa-solid fa-box"
    },
    {
        name: "Đã được chuyển đi",
        icon: "fa-solid fa-truck-fast"
    },
    {
        name: "Đã giao thành công",
        icon: "fa-solid fa-circle-check"
    },
    {
        name: "Đơn hàng đã hủy",
        icon: "fa-solid fa-trash"
    },
]

const maKhachHang = localStorage.getItem("MaKhachHang");
const tenKhachHang = localStorage.getItem('TenKhachHang');
const listOrders = ref([]);
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

const dialogState = ref({
    visible: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy bỏ',
    onConfirm: null,
    onCancel: null
});

const showConfirmDialog = (config) => {
    dialogState.value = {
        visible: true,
        title: config.title || 'Xác nhận',
        message: config.message || 'Bạn có chắc chắn muốn thực hiện hành động này?',
        type: config.type || 'warning',
        confirmText: config.confirmText || 'Xác nhận',
        cancelText: config.cancelText || 'Hủy bỏ',
        onConfirm: config.onConfirm,
        onCancel: config.onCancel
    };
};

const handleDialogConfirm = () => {
    if (dialogState.value.onConfirm) {
        dialogState.value.onConfirm();
    }
    dialogState.value.visible = false;
};

const handleDialogCancel = () => {
    if (dialogState.value.onCancel) {
        dialogState.value.onCancel();
    }
    dialogState.value.visible = false;
};

const handleDialogClose = () => {
    dialogState.value.visible = false;
};

const fetchOrders = async (maKhachHang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/donhang/khachhang/${maKhachHang}`);
        listOrders.value = response.data.map(order => {
            return {
                ...order,
                NgayDatHang: new Date(order.NgayDatHang)
            }
        })
        listOrders.value.sort((a, b) => b.NgayDatHang - a.NgayDatHang);
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const createNotification = async (message) => {
    const now = new Date();
    const notificationData = {
        ThongBao: message,
        NguoiChinhSua: tenKhachHang,
        ThoiGian: now.toISOString(),
    };
    await axios.post('http://localhost:3000/api/thongbao', notificationData);
};


const deleteOrder = async (maDonHang) => {
    showConfirmDialog({
        title: 'Thông báo xác nhận',
        message: 'Bạn có chắc chắn muốn hủy đơn hàng này không?',
        type: 'error',
        confirmText: 'Xác nhận hủy',
        cancelText: 'Hủy bỏ',
        onConfirm: async () => {
            try {
                const response = await axios.patch(`http://localhost:3000/api/donhang/${maDonHang}`);

                await createNotification(`Đơn hàng vừa được hủy!`);

                showNotification("Hủy đơn hàng thành công! Liên hệ với cửa hàng để được hoàn tiền nếu thanh toán online nhé.", "success");
                await fetchOrders(maKhachHang);
            } catch (error) {
                showNotification(error.response?.data?.message || "Hủy đơn hàng thất bại!", "error");
            }
            setTimeout(() => {
                notification.value.message = '';
            }, 3000);
        }
    });
}

const updatedStatus = async (maDonHang, currentStatus) => {
    const statusOrder = ["Đang chờ xác nhận", "Đang chờ lấy hàng", "Đã được chuyển đi", "Đã nhận được hàng", "Đã giao thành công"];
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (currentIndex === -1 || currentIndex >= statusOrder.length - 1) {
        showNotification("Trạng thái đơn hàng không hợp lệ hoặc đã ở trạng thái cuối cùng.", "error");
        setTimeout(() => {
            notification.value.message = '';
        }, 3000);
        return;
    }

    const newStatus = statusOrder[currentIndex + 1];

    showConfirmDialog({
        title: 'Thông báo xác nhận',
        message: 'Bạn có chắc chắn nhận được đơn hàng chưa, nếu đã nhận được hãy xác nhận nhé?',
        type: 'success',
        confirmText: 'Đã nhận được',
        cancelText: 'Hủy bỏ',
        onConfirm: async () => {
            try {
                const response = await axios.patch(`http://localhost:3000/api/donhang/trangthai/${maDonHang}`, {
                    newStatus: newStatus,
                });

                await createNotification(`Đơn hàng của ${tenKhachHang} đã được giao thành công!`);

                await fetchOrders(maKhachHang);
            } catch (err) {
                console.error("Error updating status:", err);
            }
        }
    });
};

// const checkOrderReviewed = async (idDonHang) => {
//     try {
//         const response = await axios.get(`http://localhost:3000/api/donhang/kiemtradanhgia/${idDonHang}`)
//         if (response.data.results) {
//             showNotification("Bạn đã đánh giá đơn hàng này rồi.", "error");
//             setTimeout(() => {
//                 notification.value.message = '';
//             }, 3000);
//             return;
//         } else {
//             router.push(`/feedback/${idDonHang}`)
//         }
//     } catch (err) {
//         console.log("Error fetching orderReviewed:", err);
//     }
// }

const selectedType = ref("");
const selectTypeOrders = (type) => {
    selectedType.value = type;
};

const filterOrders = computed(() => {
    return listOrders.value.filter(order => {
        const matchesType = order.TrangThaiDon === selectedType.value;
        return matchesType;
    })
})
const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' };
    const formattedDate = date.toLocaleDateString('vi-VN', options);
    return formattedDate;
};

function formatCurrency(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

onMounted(() => {
    fetchOrders(maKhachHang);
})
</script>

<template>
    <div
        class="bg-gradient-to-br from-[#0F1419] via-[#1A1D27] to-[#0F1419] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative mb-5 m-2 lg:mx-[150px] flex items-center flex-col flex-grow">
            <div class="flex flex-col gap-4 justify-center items-center mb-4">
                <h1 class="text-center text-white text-[28px] font-semibold mt-6 uppercase">Thông tin đơn hàng</h1>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                    <button v-for="option in options" :key="option" @click="selectTypeOrders(option.name)"
                        class="border-2 px-10 lg:px-5 py-3 bg-white flex justify-center items-center gap-4 rounded-md hover:bg-gradient-to-r hover:from-indigo-400 hover:to-purple-600 hover:text-white transition-all duration-300">
                        <i :class="option.icon"></i> {{ option.name }}
                    </button>
                </div>
            </div>
            <div class="w-full m-4 p-3" v-if="filterOrders.length > 0">
                <div v-for="(order, index) in filterOrders" :key="index"
                    class="bg-[#242424] flex flex-col mb-5 overflow-hidden px-4 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div
                        class="flex flex-col gap-2 lg:flex-row justify-center items-center lg:justify-between text-white font-semibold">
                        <p class="text-[14px]">Ngày đặt hàng: <span class="text-[#FFD700]">{{
                            formatDate(order.NgayDatHang)
                                }}</span></p>
                        <p class="text-[14px] text-center lg:text-start">
                            {{ order.TrangThaiDon }}</p>
                    </div>
                    <hr class="my-3">
                    <div class="overflow-y-auto max-h-[250px] flex flex-col gap-4">
                        <div class="flex gap-4 border-b-[1px] pb-4 mb-3 items-start"
                            v-for="(product, index) in order.SanPhamDaMua" :key="index">
                            <img :src="`${product.HinhAnh}`" class="w-[100px]" alt="">
                            <div class="flex flex-col gap-1">
                                <div class="w-44 block lg:hidden whitespace-nowrap text-ellipsis overflow-hidden">
                                    <p
                                        class="text-white font-semibold text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">
                                        {{ product.TenSanPham }}</p>
                                </div>
                                <p class="text-[14px] font-semibold text-white hidden lg:block">{{ product.TenSanPham }}
                                </p>
                                <p class="text-[14px] text-white font-medium">Loại sản phẩm: {{ product.LoaiSanPham }}
                                </p>
                                <p class="text-[14px] text-white font-medium">Đơn giá: <span class="text-[#FFD700]">{{
                                    formatCurrency(product.Gia) }} <span class="text-[14px] relative -top-[2px] underline">đ</span></span></p>
                                <p class="text-[14px] text-white font-medium">Số lượng: <span class="text-[#FFD700]">{{
                                    product.SoLuong }}</span></p>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-1">
                        <h1 class="text-[16px] font-semibold text-white">Thông tin nhận hàng</h1>
                        <div class="flex lg:flex-row flex-col justify-between">
                            <div v-for="(address, index) in order.DiaChiNhanHang" :key="index">
                                <p class="text-white text-[14px]">Họ tên: {{ address.TenNguoiNhan }}</p>
                                <p class="text-white text-[14px]">Điện thoại: {{ address.DienThoai }}</p>
                                <p class="text-white text-[14px]">Điạ chỉ: {{ address.DiaChi }}</p>
                                <p class="text-white text-[14px]">Ghi chú: {{ order.GhiChu }}</p>
                            </div>
                            <div>
                                <p class="text-white text-[14px]">Trạng thái thanh toán: {{ order.TrangThaiThanhToan }}
                                </p>
                                <p class="text-white text-[14px]">Mã giảm giá: {{ order.IdMaGiamGia === "" ? "Không sử dụng" : order.IdMaGiamGia }}</p>
                                <p class="text-white text-[14px]">Hình thức thanh toán: {{ order.HinhThucThanhToan }}
                                </p>
                                <p class="text-white text-[14px]">Hình thức vận chuyển: {{ order.HinhThucVanChuyen }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <hr class="my-3">
                    <div
                        class="flex flex-col gap-2 lg:flex-row justify-center items-center lg:justify-between text-white font-semibold">
                        <p class="text-[14px] text-center lg:text-start">Lưu ý: <span class="text-[#FFD700]">Đơn hàng
                                chỉ được hủy khi chưa được chuyển đi</span></p>
                        <p class="text-[14px] text-center lg:text-start">Tổng đơn: <span class="text-[#FFD700]">{{
                            formatCurrency(order.TongDon) }} <span class="text-[14px] relative -top-[2px] underline">đ</span></span></p>
                    </div>
                    <div class="flex gap-3 justify-end">
                        <router-link :to="`/feedback/${order.MaDonHang}`"
                            :class="(order.TrangThaiDon === 'Đã nhận được hàng' || order.TrangThaiDon === 'Đã giao thành công') ? 'block' : 'hidden'"
                            class="bg-[#4169E1] px-5 py-2 rounded-md text-white self-end w-auto mt-4">Đánh giá</router-link>
                        <button @click.prevent="deleteOrder(order.MaDonHang)"
                            :class="order.TrangThaiDon === 'Đang chờ xác nhận' ? 'block' : 'hidden'"
                            class="bg-[#DB3F4C] px-5 py-2 rounded-md text-white self-end w-auto mt-4">Hủy đơn
                            hàng</button>
                        <button @click="updatedStatus(order.MaDonHang, order.TrangThaiDon)"
                            :class="(order.TrangThaiDon === 'Đã được chuyển đi') ? 'block' : 'hidden'"
                            class="bg-[#008B8B] px-5 py-2 rounded-md text-white self-end w-auto mt-4">Đã nhận được
                            hàng</button>
                    </div>
                    <p :class="order.TrangThaiDon === 'Đã được chuyển đi' ? 'block' : 'hidden'"
                        class="font-medium text-white text-center lg:text-end mt-3">Vui lòng chỉ xác nhận khi bạn đã
                        nhận được hàng.</p>
                </div>
            </div>
            <EmtyState v-else icon="fa-bag-shopping" title="Chưa có đơn hàng nào"
                message="Hiện tại bạn vẫn chưa có đơn hàng nào, Hãy lựa chọn sản phẩm phù hợp và tiến hành đặt hàng ngay nhé!" />
        </div>
        <Footer />
        <BackToTop />
        <Chat />
        <ChatBot />
        <NotificationClient :message="notification.message" :type="notification.type" />
        <ConfirmDialog :visible="dialogState.visible" :title="dialogState.title" :message="dialogState.message"
            :type="dialogState.type" :confirmText="dialogState.confirmText" :cancelText="dialogState.cancelText"
            @confirm="handleDialogConfirm" @cancel="handleDialogCancel" @close="handleDialogClose" />
    </div>
</template>