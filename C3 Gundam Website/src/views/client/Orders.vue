<script setup>
import { ref, onMounted, watch } from "vue";
import Header from "@/components/client/Header.vue";
import Footer from "@/components/client/Footer.vue";
import BackToTop from "@/components/client/BackToTop.vue";
import NotificationClient from "@/components/Notification/NotificationClient.vue";
import ConfirmDialog from "@/components/Notification/ConfirmDialog.vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();

const errors = ref({});
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};
const formData = ref({
    address: "",
    description: "",
    discountCode: "",
    payment: "",
    shippingMethod: "",
});

const maKhachHang = localStorage.getItem("MaKhachHang");
const nameCustomer = ref("");
const emailCustomer = ref("");
const listAddress = ref([]);
const listDiscountCodes = ref([]);
const discountCodeWithCustomer = ref([]);
const images = ref([]);
const nameProducts = ref("");
const maSanPham = ref("");
const type = ref("");
const price = ref(0);
const quantity = ref(1);
const totalProductPrice = ref(0); // Giá sản phẩm gốc
const finalProductPrice = ref(0); // Giá sản phẩm sau giảm
const discountAmount = ref(0); // Số tiền giảm
const totalPrice = ref(0); // Tổng giá (sản phẩm sau giảm + phí ship)
const shippingFee = ref(0);
const shippingDetails = ref({ baseFee: 0 });
const isPayPalReady = ref(false); // Cờ để xác định trạng thái nút PayPal
const isVNPayReady = ref(false);

const notification = ref({
    message: "",
    type: "",
});

const showNotification = (msg, type) => {
    notification.value = { message: msg, type: type };
    setTimeout(() => {
        notification.value.message = "";
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

// Tính phí ship
const calculateShippingFee = async () => {
    if (!formData.value.address) {
        shippingFee.value = 0;
        formData.value.shippingMethod = '';
        return;
    }
    try {
        const response = await axios.post('http://localhost:3000/api/donhang/tinhphiship', {
            address: formData.value.address,
            ttotalOrder: finalProductPrice.value,
        });
        shippingFee.value = response.data.shippingFee;
        shippingDetails.value = response.data.details;
        formData.value.shippingMethod = response.data.shippingMethod;
    } catch (error) {
        showNotification(error.response?.data?.message || 'Lỗi tính phí ship', 'error');
    }
};

// Tính giá sau giảm giá
const calculateDiscount = async () => {
    try {
        const response = await axios.post('http://localhost:3000/api/donhang/capnhatmagiamgia', {
            IdMaGiamGia: formData.value.discountCode,
            MaKhachHang: maKhachHang,
            totalProductPrice: totalProductPrice.value,
        });
        if (response.data.success) {
            finalProductPrice.value = response.data.finalPrice;
            discountAmount.value = response.data.discountAmount; //Số tiền giảm được bao nhiêu
        } else {
            finalProductPrice.value = totalProductPrice.value;
            discountAmount.value = 0; //Số tiền giảm được bao nhiêu
        }
    } catch (error) {
        showNotification(error.response?.data?.message || 'Lỗi áp dụng mã giảm giá', 'error');
    }
};

// Tính tổng giá
watch([price, quantity, finalProductPrice, shippingFee], () => {
    totalProductPrice.value = price.value * quantity.value;
    finalProductPrice.value = totalProductPrice.value; // Mặc định nếu chưa có giảm giá
    totalPrice.value = finalProductPrice.value + shippingFee.value;
});

const fetchProduct = async (idProduct) => {
    try {
        const response = await axios.get(
            `http://localhost:3000/api/sanpham/${idProduct}`
        );
        images.value = response.data.Images;
        nameProducts.value = response.data.TenSanPham;
        maSanPham.value = response.data.MaSanPham;
        price.value = Number(response.data.GiaBan);
        type.value = response.data.LoaiSanPham;
    } catch (err) {
        console.log("error fetching:", err);
    }
};

const fetchDiscountCode = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/magiamgia');
        listDiscountCodes.value = response.data.map(discountCode => ({
            ...discountCode,
            IdKhachHangSuDung: Array.isArray(discountCode.IdKhachHangSuDung)
                ? discountCode.IdKhachHangSuDung
                : [] // Đảm bảo IdKhachHangSuDung là mảng
        }));
        return true; // Trả về true để báo hiệu thành công
    } catch (error) {
        console.error('Error fetching discount codes:', error);
        return false; // Trả về false để báo hiệu lỗi
    }
};

const fetchCustomer = async (idKhachHang) => {
    try {
        // Đảm bảo lấy danh sách mã giảm giá trước
        const discountFetchSuccess = await fetchDiscountCode();
        if (!discountFetchSuccess) {
            throw new Error('Không thể lấy danh sách mã giảm giá');
        }

        // Lấy dữ liệu khách hàng
        const response = await axios.get(`http://localhost:3000/api/khachhang/${idKhachHang}`);
        nameCustomer.value = response.data.TenKhachHang;
        emailCustomer.value = response.data.Email;
        listAddress.value = response.data.DanhSachDiaChi || [];

        // Lấy danh sách IdMaGiamGia từ DanhSachMaGiamGia
        const customerDiscountIds = Array.isArray(response.data.DanhSachMaGiamGia)
            ? response.data.DanhSachMaGiamGia
                .map(item => item.IdMaGiamGia)
                .filter(id => id) // Lọc các id hợp lệ
            : [];
        console.log("Danh sách IdMaGiamGia từ khách hàng:", customerDiscountIds);

        // Lọc mã giảm giá: chỉ giữ mã trong DanhSachMaGiamGia và chưa được khách hàng sử dụng
        discountCodeWithCustomer.value = listDiscountCodes.value
            .filter(discountCode =>
                customerDiscountIds.includes(discountCode.IdMaGiamGia) && // Khớp với DanhSachMaGiamGia
                !discountCode.IdKhachHangSuDung.includes(idKhachHang) // Chưa được khách hàng sử dụng
            )
            .map(discountCode => ({
                ...discountCode
            }));

        console.log("Mã giảm giá chưa sử dụng của khách hàng:", discountCodeWithCustomer.value);
    } catch (err) {
        console.error("Error fetching customer:", err.response?.data || err.message);
    }
};

const addOrders = async () => {
    errors.value = {};

    if (!formData.value.address) {
        errors.value.address = "Nếu chưa có địa chỉ vui lòng tạo địa chỉ.";
    }

    if (formData.value.description) {
        formData.value.description = escapeHtml(formData.value.description);
    }

    if (formData.value.discountCode) {
        formData.value.discountCode = escapeHtml(formData.value.discountCode);
    }

    if (!formData.value.payment) {
        errors.value.payment = "Chọn phương thức thanh toán phù hợp.";
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    let trangThaiThanhToan = "Khi nhận được hàng";
    if (formData.value.payment === "Thanh toán qua Paypal") {
        trangThaiThanhToan = "Đã thanh toán qua PayPal";
    }

    if (totalPrice.value >= 2000000) {
        formData.value.shippingMethod = "Miễn phí giao hàng";
    }

    const dataToSend = {
        MaKhachHang: maKhachHang,
        SanPhamDaMua: {
            TenSanPham: nameProducts.value,
            MaSanPham: maSanPham.value,
            Gia: price.value,
            SoLuong: quantity.value,
            LoaiSanPham: type.value,
            HinhAnh: images.value[0],
        },
        DiaChiNhanHang: formData.value.address,
        IdMaGiamGia: formData.value.discountCode,
        HinhThucThanhToan: formData.value.payment,
        TongDon: totalPrice.value,
        NgayDatHang: new Date(),
        GhiChu: formData.value.description || "Không có ghi chú",
        TrangThaiThanhToan: trangThaiThanhToan,
        HinhThucVanChuyen: formData.value.shippingMethod,
    };

    // Nếu thanh toán qua PayPal thì redirect trực tiếp
    if (formData.value.payment === "Thanh toán qua Paypal") {
        try {
            const response = await axios.post(
                "http://localhost:3000/api/donhang",
                dataToSend
            );
            showNotification(
                "Đặt hàng thành công, vui lòng kiểm tra email xác nhận!",
                "success"
            );

            await axios.post(
                `http://localhost:3000/api/donhang/guiemail?email=${emailCustomer.value}`
            );
            setTimeout(() => {
                router.push("/orders_history");
            }, 0);
        } catch (error) {
            showNotification(
                error.response?.data?.message || "Đặt hàng thất bại!",
                "error"
            );
        }
        return;
    }

    // Với các phương thức thanh toán khác, hiển thị dialog xác nhận
    showConfirmDialog({
        title: 'Xác nhận đặt hàng',
        message: 'Vui lòng kiểm tra lại thông tin trước khi đặt hàng?',
        type: 'info',
        confirmText: 'Đặt hàng',
        cancelText: 'Hủy bỏ',
        onConfirm: async () => {
            try {
                const response = await axios.post(
                    "http://localhost:3000/api/donhang",
                    dataToSend
                );
                showNotification(
                    "Đặt hàng thành công, vui lòng kiểm tra email xác nhận!",
                    "success"
                );

                await axios.post(
                    `http://localhost:3000/api/donhang/guiemail?email=${emailCustomer.value}`
                );
                setTimeout(() => {
                    router.push("/orders_history");
                }, 2000);
            } catch (error) {
                showNotification(
                    error.response?.data?.message || "Đặt hàng thất bại!",
                    "error"
                );
            }
        }
    });
};

const initializePayPalButton = () => {
    if (typeof paypal === "undefined") {
        console.error("PayPal SDK chưa được tải.");
        return;
    }
    const paypalButtonsContainer = document.getElementById(
        "paypal-button-container"
    );
    if (paypalButtonsContainer) {
        paypalButtonsContainer.innerHTML = ""; // Xóa nội dung cũ
    }
    const vndToUsdRate = 25000; // Tỷ giá cố định (Ví dụ: 1 USD = 25,000 VND)
    paypal
        .Buttons({
            createOrder: (data, actions) => {
                const usdPrice = (totalPrice.value / vndToUsdRate).toFixed(2); // Chuyển đổi VND sang USD
                return actions.order.create({
                    purchase_units: [
                        {
                            amount: {
                                value: usdPrice, // Giá trị đã chuyển đổi
                                currency_code: "USD", // Đơn vị tiền tệ là USD
                            },
                        },
                    ],
                });
            },
            onApprove: async (data, actions) => {
                try {
                    const order = await actions.order.capture();
                    await addOrders();

                    if (notification.value.type === "success") {
                        showNotification(
                            "Thanh toán qua PayPal và đặt hàng thành công, vui lòng kiểm tra email xác nhận!",
                            "success"
                        );
                    }
                } catch (error) {
                    console.error("Lỗi khi xử lý đơn hàng sau thanh toán PayPal:", error);
                    showNotification(
                        "Thanh toán thành công nhưng không thể lưu đơn hàng!",
                        "error"
                    );
                }
                setTimeout(() => {
                    notification.value.message = "";
                }, 3000);
            },
            onError: (err) => {
                console.error("Lỗi khi thanh toán PayPal:", err);
                showNotification("Đã xảy ra lỗi khi thanh toán qua PayPal!", "error");
            },
        })
        .render("#paypal-button-container");
};

const createPaymentVNPay = async () => {
    errors.value = {};

    if (!formData.value.address) {
        errors.value.address = "Nếu chưa có địa chỉ vui lòng tạo địa chỉ.";
    }

    if (formData.value.description) {
        formData.value.description = escapeHtml(formData.value.description);
    }

    if (formData.value.discountCode) {
        formData.value.discountCode = escapeHtml(formData.value.discountCode);
    }

    if (!formData.value.payment) {
        errors.value.payment = "Chọn phương thức thanh toán phù hợp.";
    }

    if (!formData.value.shippingMethod) {
        errors.value.shippingMethod = "Vui lòng chọn hình thức giao hàng.";
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }
    showConfirmDialog({
        title: 'Xác nhận đặt hàng',
        message: 'Vui lòng kiểm tra lại thông tin trước khi thanh toán qua VNPAY?',
        type: 'info',
        confirmText: 'Đặt hàng',
        cancelText: 'Hủy bỏ',
        onConfirm: async () => {
            let trangThaiThanhToan = "Khi nhận được hàng";
            if (formData.value.payment === "Thanh toán qua VNPAY") {
                trangThaiThanhToan = "Đã thanh toán qua VNPAY";
            }

            if (totalPrice.value >= 2000000) {
                formData.value.shippingMethod = "Miễn phí giao hàng";
            }

            try {
                const tempOrder = {
                    MaKhachHang: maKhachHang,
                    SanPhamDaMua: {
                        TenSanPham: nameProducts.value,
                        MaSanPham: maSanPham.value,
                        Gia: price.value,
                        SoLuong: quantity.value,
                        LoaiSanPham: type.value,
                        HinhAnh: images.value[0],
                    },
                    DiaChiNhanHang: formData.value.address,
                    IdMaGiamGia: formData.value.discountCode,
                    HinhThucThanhToan: "Thanh toán qua VNPAY",
                    TongDon: totalPrice.value,
                    NgayDatHang: new Date(),
                    GhiChu: formData.value.description || "Không có ghi chú",
                    TrangThaiThanhToan: trangThaiThanhToan,
                    HinhThucVanChuyen: formData.value.shippingMethod,
                };

                const response = await axios.post(
                    "http://localhost:3000/api/donhang/luutamdon",
                    tempOrder
                );
                const maDonHang = response.data.MaDonHang;
                const paymentResponse = await axios.post(
                    "http://localhost:3000/api/thanhtoanvnp",
                    {
                        amount: totalPrice.value,
                        orderId: maDonHang,
                        orderInfo: `Thanh toán đơn hàng ${maSanPham.value} cho ${nameCustomer.value}###${emailCustomer.value}`,
                        ipAddr: "127.0.0.1",
                    }
                );
                window.location.href = paymentResponse.data.paymentUrl;
            } catch (error) {
                showNotification(
                    error.response?.data?.message || "Không thể tạo URL thanh toán VNPAY!",
                    "error"
                );
            }
        }
    });
};

function formatCurrency(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

onMounted(() => {
    const idProduct = router.currentRoute.value.params.maSanPham;
    const soluong = router.currentRoute.value.query.quantity;
    quantity.value = Number(soluong) || 1;
    fetchProduct(idProduct);
    fetchCustomer(maKhachHang);
    fetchDiscountCode();
});

watch(
    () => formData.value.payment,
    (newPayment) => {
        if (newPayment === "Thanh toán qua Paypal") {
            isPayPalReady.value = true; // Hiển thị nút PayPal
            isVNPayReady.value = false;
            initializePayPalButton();
        } else if (newPayment === "Thanh toán qua VNPAY") {
            isVNPayReady.value = true;
            isPayPalReady.value = false; // Ẩn nút PayPal
        } else {
            isPayPalReady.value = false;
            isVNPayReady.value = false;
        }
    }
);

watch(() => formData.value.address, () => {
    calculateShippingFee();
});

watch(() => formData.value.discountCode, () => {
    calculateDiscount();
});
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative my-5 m-2 lg:mx-[200px] flex justify-center items-center flex-grow">
            <div class="w-full m-4">
                <div
                    class="bg-[#242424] overflow-hidden px-6 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div class="flex flex-col gap-2 justify-center">
                        <form @submit.prevent="addOrders" method="POST"
                            class="flex flex-col justify-end items-end gap-6">
                            <div class="flex flex-col lg:flex-row gap-8 w-full">
                                <div class="flex flex-col gap-4 w-full lg:w-1/2 text-white lg:border-r-2 lg:pr-10">
                                    <p class="text-white font-semibold text-[20px]">
                                        Thông tin mua hàng
                                    </p>
                                    <hr />
                                    <div class="w-full">
                                        <label for=""
                                            class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Người
                                            đặt hàng</label>
                                        <input type="text" v-model="nameCustomer" readonly
                                            placeholder="Nhập họ tên của bạn ..."
                                            class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                    </div>
                                    <div class="w-full">
                                        <label for=""
                                            class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Email</label>
                                        <input type="text" v-model="emailCustomer" readonly placeholder="079xxxxxxx"
                                            class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                    </div>
                                    <div class="w-full">
                                        <label for=""
                                            class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Địa chỉ
                                            nhận hàng:
                                        </label>
                                        <select name="" id="" v-model="formData.address"
                                            class="w-full text-white px-4 py-2 rounded-md cursor-pointer bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out">
                                            <option class="text-[#333] cursor-pointer" value="">
                                                Chọn địa chỉ nhận hàng
                                            </option>
                                            <option v-for="(address, index) in listAddress" :key="index"
                                                :value="address" class="text-[#333] cursor-pointer">
                                                {{ address.TenNguoiNhan }} / {{ address.DienThoai }} /
                                                {{ address.DiaChi }}
                                            </option>
                                        </select>
                                        <p class="mt-2 text-white/65 text-[14px]">
                                            Thêm địa chỉ ở phần danh mục cá nhân nếu chưa có.
                                        </p>
                                        <p v-if="errors.address" class="text-red-500 text-sm mt-2">
                                            {{ errors.address }}
                                        </p>
                                    </div>
                                    <div class="w-full">
                                        <label for=""
                                            class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Ghi
                                            chú</label>
                                        <textarea type="text" v-model="formData.description" placeholder="Ghi chú ..."
                                            class="w-full h-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                        <p v-if="errors.description" class="text-red-500 text-sm mt-2">
                                            {{ errors.description }}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex flex-col gap-4 w-full lg:w-1/2">
                                    <p class="text-white font-semibold text-[20px]">Đơn hàng</p>
                                    <hr />
                                    <div class="flex flex-col gap-4 overflow-hidden">
                                        <div class="overflow-y-auto max-h-[200px] flex flex-col gap-4">
                                            <div class="flex gap-4 items-start">
                                                <img :src="`${images[0]}`" class="w-[50px] lg:w-[80px] border-2"
                                                    alt="" />
                                                <div class="overflow-hidden">
                                                    <div
                                                        class="w-52 lg:w-96 whitespace-nowrap text-ellipsis overflow-hidden">
                                                        <p
                                                            class="text-white text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">
                                                            {{ nameProducts }}
                                                        </p>
                                                    </div>
                                                    <p class="text-white text-[14px]">
                                                        Mã sản phẩm:
                                                        <span class="text-[#FFD700]">{{ maSanPham }}</span>
                                                    </p>
                                                    <p class="text-white text-[14px]">
                                                        Giá:
                                                        <span class="text-[#FFD700]">{{ formatCurrency(price) }}
                                                            VNĐ</span>
                                                    </p>
                                                    <p class="text-white text-[14px]">
                                                        Số lượng:
                                                        <span class="text-[#FFD700]">{{ quantity }}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <hr />
                                        <div class="w-full">
                                            <label for=""
                                                class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Mã
                                                giảm giá:
                                            </label>
                                            <select name="" id="" v-model="formData.discountCode"
                                                class="w-full text-white px-4 py-2 rounded-md cursor-pointer bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out">
                                                <option class="text-[#333] cursor-pointer" value="">
                                                    Danh sách mã giảm giá của bạn
                                                </option>
                                                <option
                                                    v-for="(discountCode, index) in discountCodeWithCustomer.filter((dc) => new Date(dc.NgayHetHan) >= new Date())"
                                                    :key="index" :value="discountCode.IdMaGiamGia"
                                                    class="text-[#333] cursor-pointer">
                                                    Id Mã: {{ discountCode.IdMaGiamGia }} / Tên mã:
                                                    {{ discountCode.TenMaGiamGia }} / Giảm:
                                                    {{
                                                        discountCode.GiamTien
                                                            ? `${formatCurrency(discountCode.GiamTien)} VNĐ`
                                                            : `${discountCode.GiamPhanTram}%`
                                                    }}
                                                </option>
                                            </select>
                                            <p v-if="errors.discountCode" class="text-red-500 text-sm mt-2">
                                                {{ errors.discountCode }}
                                            </p>
                                        </div>
                                        <div class="w-full">
                                            <label for=""
                                                class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Hình
                                                thức thanh toán:
                                            </label>
                                            <select name="" id="" v-model="formData.payment"
                                                class="w-full text-white px-4 py-2 rounded-md cursor-pointer bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out">
                                                <option class="text-[#333] cursor-pointer" value="">
                                                    Chọn phương thức thanh toán
                                                </option>
                                                <option class="text-[#333] cursor-pointer"
                                                    value="Thanh toán khi nhận hàng">
                                                    Thanh toán khi nhận hàng
                                                </option>
                                                <option class="text-[#333] cursor-pointer"
                                                    value="Thanh toán qua Paypal">
                                                    Thanh toán qua Paypal
                                                </option>
                                                <option class="text-[#333] cursor-pointer" value="Thanh toán qua VNPAY">
                                                    Thanh toán qua VNPAY
                                                </option>
                                            </select>
                                            <p v-if="errors.payment" class="text-red-500 text-sm mt-2">
                                                {{ errors.payment }}
                                            </p>
                                        </div>
                                        <div class="w-full">
                                            <label
                                                class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Hình
                                                thức giao hàng</label>
                                            <div class="p-3 rounded-lg border border-gray-500 bg-gray-800">
                                                <span class="text-white">{{ formData.shippingMethod || 'Đang tính phí ship...' }}</span>
                                            </div>
                                        </div>
                                        <hr />
                                        <p class="text-white text-[15px] text-end" v-if="discountAmount > 0">Giảm giá:
                                            <span class="text-[#FFD700]">-{{ formatCurrency(discountAmount) }}
                                                VNĐ</span>
                                        </p>
                                        <p class="text-white text-[15px] text-end">Phí vận chuyển: <span
                                                class="text-[#FFD700]">{{
                                                    formatCurrency(shippingDetails.baseFee) }} VNĐ</span></p>
                                        <p class="text-white text-[16px] text-end">Tổng cộng: <span
                                                class="text-[#FFD700]"> {{ formatCurrency(totalPrice - discountAmount)
                                                }} VNĐ</span></p>
                                        <button type="submit" :class="formData.payment === 'Thanh toán khi nhận hàng' ||
                                            formData.payment === ''
                                            ? 'block'
                                            : 'hidden'
                                            "
                                            class="px-6 py-3 bg-[#DB3F4C] rounded-md text-white font-medium self-end w-full">
                                            Đặt hàng
                                        </button>
                                        <button type="button" @click="createPaymentVNPay()"
                                            :class="isVNPayReady ? 'block' : 'hidden'"
                                            class="flex gap-2 items-center justify-center px-6 py-3 bg-[#4169E1] rounded-md text-white font-medium self-end w-full">
                                            Thanh toán qua
                                            <img src="../../assets/img/vnpay.png" class="w-6 h-6" alt="" /><span
                                                class="font-bold font-bungee">VN <span
                                                    class="text-[#DC143C]">Pay</span></span>
                                        </button>
                                        <div :class="isPayPalReady ? 'block' : 'hidden'" id="paypal-button-container">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
        <BackToTop />
        <NotificationClient :message="notification.message" :type="notification.type" />
        <ConfirmDialog :visible="dialogState.visible" :title="dialogState.title" :message="dialogState.message"
            :type="dialogState.type" :confirmText="dialogState.confirmText" :cancelText="dialogState.cancelText"
            @confirm="handleDialogConfirm" @cancel="handleDialogCancel" @close="handleDialogClose" />
    </div>
</template>
