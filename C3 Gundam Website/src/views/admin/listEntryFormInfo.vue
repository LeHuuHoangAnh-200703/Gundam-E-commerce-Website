<script setup>
import { onMounted, ref } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import NotificationAdmin from "@/components/Notification/NotificationAdmin.vue";
import ConfirmDialog from "@/components/Notification/ConfirmDialog.vue";
import axios from "axios";
import { useRouter } from 'vue-router';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Gán font cho pdfMake
pdfMake.vfs = pdfFonts;

const router = useRouter();

// --- CẤU HÌNH URL ĐỘNG ---
// Tự động nhận diện môi trường: Netlify (Production) hoặc Localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// -------------------------

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

const fetchEntryForm = async (idPhieuNhap) => {
    try {
        // SỬA 1: Dùng API_URL
        const response = await axios.get(`${API_URL}/api/phieunhap/${idPhieuNhap}`);
        idEntryForm.value = response.data.MaPhieuNhap;
        idSupplier.value = response.data.MaNhaCungCap;
        timeEntryForm.value = new Date(response.data.NgayNhap);
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const fetchProducts = async () => {
    try {
        // SỬA 2: Dùng API_URL
        const response = await axios.get(`${API_URL}/api/sanpham`);
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

        showConfirmDialog({
            title: 'Thông báo xác nhận',
            message: 'Vui lòng xác nhận lại thông tin trước khi thêm?',
            type: 'info',
            confirmText: 'Xác nhận',
            cancelText: 'Hủy bỏ',
            onConfirm: async () => {
                // SỬA 3: Dùng API_URL
                const response = await axios.post(`${API_URL}/api/chitietphieunhap`, dataToSend);

                const notificationData = {
                    ThongBao: `Chi tiết phiếu nhập ${idEntryForm.value} vừa được thêm.`,
                    NguoiChinhSua: TenAdmin,
                    ThoiGian: ThoiGian,
                };

                // SỬA 4: Dùng API_URL
                await axios.post(`${API_URL}/api/thongbao`, notificationData);

                showNotification("Thêm chi tiết phiếu nhập thành công!", "success");
                fetchEntryFormInfos();
                fetchProducts();
            }
        });
    } catch (error) {
        showNotification(error.response?.data?.message || "Thêm chi tiết phiếu nhập thất bại!", "error");
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

const fetchEntryFormInfos = async () => {
    try {
        // SỬA 5: Dùng API_URL
        const response = await axios.get(`${API_URL}/api/chitietphieunhap`);
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

const exportToPDF = async (maPN) => {
    showConfirmDialog({
        title: 'Thông báo xác nhận',
        message: `Bạn có muốn xuất phiếu nhập kho của ${maPN} không?`,
        type: 'info',
        confirmText: 'Xuất phiếu nhập',
        cancelText: 'Hủy bỏ',
        onConfirm: async () => {
            try {
                // Lấy dữ liệu chi tiết phiếu nhập
                // SỬA 6: Dùng API_URL
                const response = await axios.get(`${API_URL}/api/chitietphieunhap/phieunhap/${maPN}`);
                const data = response.data;

                if (!Array.isArray(data) || data.length === 0) {
                    showNotification('Không có dữ liệu để xuất!', 'error');
                    return;
                }

                // Lấy thông tin phiếu nhập
                // SỬA 7: Dùng API_URL
                const phieuNhapResponse = await axios.get(`${API_URL}/api/phieunhap/${maPN}`);
                const phieuNhapInfo = phieuNhapResponse.data;

                // Lấy thông tin nhà cung cấp
                // SỬA 8: Dùng API_URL
                const nhaCungCapResponse = await axios.get(`${API_URL}/api/nhacungcap/${phieuNhapInfo.MaNhaCungCap}`);
                const nhaCungCapInfo = nhaCungCapResponse.data;

                // Tính tổng tiền
                const tongTien = data.reduce((total, item) => total + (item.SoLuong * item.GiaNhap), 0);

                const docDefinition = {
                    content: [
                        { text: 'C3 GUNDAM STORE', style: 'header' },
                        { text: 'Địa chỉ: Đường 96 - Tân Phú - TX.Long Mỹ - Hậu Giang', style: 'subheader' },
                        { text: 'Điện thoại: 079.965.8592', style: 'subheader' },
                        { text: '_______________________________________________________________________________________________', alignment: 'center' },
                        { text: '\nPHIẾU NHẬP KHO', style: 'title' },
                        { text: `Số phiếu nhập: ${maPN}`, style: 'subheader2' },
                        { text: `Ngày nhập kho: ${formatDateForPDF(phieuNhapInfo.NgayNhap)}`, style: 'subheader2' },
                        { text: `Nhà cung cấp: ${nhaCungCapInfo.TenNhaCungCap || 'Không có'}`, style: 'subheader2' },
                        { text: `Người lập phiếu: ${TenAdmin}`, style: 'subheader2' },
                        { text: '\nCHI TIẾT SẢN PHẨM NHẬP KHO', style: 'sectionHeader' },
                        {
                            table: {
                                headerRows: 1,
                                widths: ['10%', '30%', '15%', '15%', '15%', '15%'],
                                body: [
                                    [
                                        { text: 'STT', style: 'tableHeader' },
                                        { text: 'Tên sản phẩm', style: 'tableHeader' },
                                        { text: 'Mã SP', style: 'tableHeader' },
                                        { text: 'Số lượng', style: 'tableHeader' },
                                        { text: 'Giá nhập', style: 'tableHeader' },
                                        { text: 'Thành tiền', style: 'tableHeader' }
                                    ],
                                    ...data.map((product, index) => [
                                        { text: (index + 1).toString(), alignment: 'center', fontSize: 9 },
                                        { text: product.TenSanPham || 'N/A', fontSize: 9 },
                                        { text: product.MaSanPham || 'N/A', alignment: 'center', fontSize: 9 },
                                        { text: (product.SoLuong || 0).toString(), alignment: 'center', fontSize: 9 },
                                        { text: formatCurrencyForPDF(product.GiaNhap || 0), alignment: 'right', fontSize: 9 },
                                        { text: formatCurrencyForPDF((product.SoLuong || 0) * (product.GiaNhap || 0)), alignment: 'right', fontSize: 9 }
                                    ])
                                ]
                            },
                            layout: {
                                hLineWidth: function (i, node) {
                                    return 1;
                                },
                                vLineWidth: function (i, node) {
                                    return 1;
                                },
                                hLineColor: function (i, node) {
                                    return '#cccccc';
                                },
                                vLineColor: function (i, node) {
                                    return '#cccccc';
                                }
                            }
                        },
                        { text: '_______________________________________________________________________________________________', alignment: 'center' },
                        {
                            text: [
                                { text: 'Tổng tiền: ', style: 'normalText' },
                                { text: `${formatCurrencyForPDF(tongTien)}`, style: 'boldText' }
                            ],
                            alignment: 'right',
                            margin: [0, 5, 0, 5]
                        },
                        {
                            text: [
                                { text: 'Bằng chữ: ', style: 'normalText' },
                                { text: `${convertNumberToWords(tongTien)} đồng`, style: 'boldText' }
                            ],
                            margin: [0, 5, 0, 20]
                        },
                        {
                            columns: [
                                {
                                    text: 'Người lập phiếu',
                                    alignment: 'center',
                                    margin: [0, 0, 0, 20],
                                    width: '33,3%'
                                },
                                {
                                    text: 'Người giao hàng',
                                    alignment: 'center',
                                    margin: [0, 0, 0, 20],
                                    width: '33,3%'
                                },
                                {
                                    text: 'Thủ kho',
                                    alignment: 'center',
                                    margin: [0, 0, 0, 20],
                                    width: '33,3%'
                                }
                            ]
                        },
                        {
                            columns: [
                                { text: '(Ký, ghi rõ họ tên)', alignment: 'center', fontSize: 9 },
                                { text: '(Ký, ghi rõ họ tên)', alignment: 'center', fontSize: 9 },
                                { text: '(Ký, ghi rõ họ tên)', alignment: 'center', fontSize: 9 }
                            ]
                        },
                        {
                            columns: [
                                { text: '_________________________', alignment: 'center' },
                                { text: '_________________________', alignment: 'center' },
                                { text: '_________________________', alignment: 'center' }
                            ]
                        }
                    ],
                    styles: {
                        header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 5] },
                        title: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 10, 0, 5] },
                        subheader: { fontSize: 10, margin: [0, 2, 0, 2], alignment: 'center' },
                        subheader2: { fontSize: 10, margin: [0, 2, 0, 2] },
                        sectionHeader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
                        total: { fontSize: 12, bold: true, alignment: 'right', margin: [0, 5, 0, 5] },
                        tableHeader: { fontSize: 9, bold: true, alignment: 'center' },
                        tableCell: { fontSize: 9 },
                        normalText: { fontSize: 12, bold: false },
                        boldText: { fontSize: 12, bold: true },
                    },
                    pageSize: 'A4',
                    pageMargins: [40, 60, 40, 60]
                };

                // Tạo và tải file PDF
                pdfMake.createPdf(docDefinition).download(`PhieuNhapKho_${maPN}.pdf`);
                showNotification('Xuất phiếu nhập kho thành công!', 'success');
            } catch (error) {
                console.error('Lỗi khi xuất phiếu nhập kho:', error.message);
                showNotification('Có lỗi xảy ra khi xuất phiếu nhập kho!', 'error');
            }
        }
    });
};

// Hàm format currency cho PDF
const formatCurrencyForPDF = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

// Hàm format date cho PDF
const formatDateForPDF = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
};

// Hàm chuyển đổi số thành chữ đơn giản
const convertNumberToWords = (num) => {
    if (num === 0) return "Không";

    const ones = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    const tens = ["", "", "hai mười", "ba mười", "bốn mười", "năm mười", "sáu mười", "bảy mười", "tám mười", "chín mười"];

    // Hàm xử lý số có 3 chữ số
    const convertHundreds = (n) => {
        let result = "";
        let hundreds = Math.floor(n / 100);
        let remainder = n % 100;

        if (hundreds > 0) {
            result += ones[hundreds] + " trăm";
            if (remainder > 0) result += " ";
        }

        if (remainder >= 20) {
            let tensDigit = Math.floor(remainder / 10);
            let onesDigit = remainder % 10;
            result += ones[tensDigit] + " mười";
            if (onesDigit > 0) {
                if (onesDigit === 1) {
                    result += " một";
                } else if (onesDigit === 5 && tensDigit > 1) {
                    result += " lăm";
                } else {
                    result += " " + ones[onesDigit];
                }
            }
        } else if (remainder >= 10) {
            let onesDigit = remainder % 10;
            result += "mười";
            if (onesDigit > 0) {
                if (onesDigit === 5) {
                    result += " lăm";
                } else {
                    result += " " + ones[onesDigit];
                }
            }
        } else if (remainder > 0) {
            result += ones[remainder];
        }

        return result;
    };

    // Xử lý số lớn
    if (num < 1000) {
        return convertHundreds(num);
    } else if (num < 1000000) {
        let thousands = Math.floor(num / 1000);
        let remainder = num % 1000;
        let result = convertHundreds(thousands) + " nghìn";
        if (remainder > 0) {
            result += " " + convertHundreds(remainder);
        }
        return result;
    } else if (num < 1000000000) {
        let millions = Math.floor(num / 1000000);
        let remainder = num % 1000000;
        let result = convertHundreds(millions) + " triệu";
        if (remainder > 0) {
            if (remainder >= 1000) {
                let thousands = Math.floor(remainder / 1000);
                let finalRemainder = remainder % 1000;
                result += " " + convertHundreds(thousands) + " nghìn";
                if (finalRemainder > 0) {
                    result += " " + convertHundreds(finalRemainder);
                }
            } else {
                result += " " + convertHundreds(remainder);
            }
        }
        return result;
    } else {
        let billions = Math.floor(num / 1000000000);
        let remainder = num % 1000000000;
        let result = convertHundreds(billions) + " tỷ";
        if (remainder > 0) {
            if (remainder >= 1000000) {
                let millions = Math.floor(remainder / 1000000);
                let finalRemainder = remainder % 1000000;
                result += " " + convertHundreds(millions) + " triệu";
                if (finalRemainder >= 1000) {
                    let thousands = Math.floor(finalRemainder / 1000);
                    let lastRemainder = finalRemainder % 1000;
                    result += " " + convertHundreds(thousands) + " nghìn";
                    if (lastRemainder > 0) {
                        result += " " + convertHundreds(lastRemainder);
                    }
                } else if (finalRemainder > 0) {
                    result += " " + convertHundreds(finalRemainder);
                }
            } else if (remainder >= 1000) {
                let thousands = Math.floor(remainder / 1000);
                let finalRemainder = remainder % 1000;
                result += " " + convertHundreds(thousands) + " nghìn";
                if (finalRemainder > 0) {
                    result += " " + convertHundreds(finalRemainder);
                }
            } else {
                result += " " + convertHundreds(remainder);
            }
        }
        return result;
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
                                                {{ product.TenSanPham }} - {{ formatCurrency(product.GiaBan) }} đ -
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
                        <button @click="exportToPDF(idEntryForm)"
                            class="bg-[#003171] text-white font-semibold py-3 px-4 rounded-md text-[14px]"><i
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
                                            {{ formatCurrency(entryFormInfo.GiaNhap) }} <span class="text-[12px] relative -top-[2px] underline">đ</span></td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                            {{ formatCurrency(entryFormInfo.TongTien) }} <span class="text-[12px] relative -top-[2px] underline">đ</span></td>
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
        <ConfirmDialog :visible="dialogState.visible" :title="dialogState.title" :message="dialogState.message"
            :type="dialogState.type" :confirmText="dialogState.confirmText" :cancelText="dialogState.cancelText"
            @confirm="handleDialogConfirm" @cancel="handleDialogCancel" @close="handleDialogClose" />
    </div>
</template>

<style scoped>
.active-link {
    background: #DB3F4C;
    color: white;
}
</style>