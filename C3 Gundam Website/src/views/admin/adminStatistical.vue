<script setup>
import { ref, onMounted } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import ConfirmDialog from "@/components/Notification/ConfirmDialog.vue";
import NotificationAdmin from "@/components/Notification/NotificationAdmin.vue";
import axios from "axios";
import { Bar } from "vue-chartjs";
import { Line } from "vue-chartjs";
import { Doughnut } from "vue-chartjs";
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    PointElement,
    LineElement,
} from "chart.js";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts;

const customers = ref([]);
const products = ref([]);
const listProducts = ref([]);
const orders = ref([]);
const feedbacks = ref([]);
const monthlyProfit = ref({
    loiNhuan: 0,
    loiNhuanFormatted: "0",
    doanhThuFormatted: "0",
    tyLeLoiNhuan: "0%",
    soDonHang: 0
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

// Dialog state với props
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
const listSelling = ref([]);

const fetchListProducts = async () => {
    try {
        const response = await axios.get("http://localhost:3000/api/sanpham");
        listProducts.value = response.data.map(product => {
            return {
                ...product
            }
        })
        listProducts.value.sort((a, b) => b.NgayBan - a.NgayBan);
    } catch (error) {
        console.log("Error fetching: ", err);
    }
}
const fetchStatistical = async () => {
    try {
        const response = await axios.get("http://localhost:3000/api/thongke");
        customers.value = response.data.customer;
        products.value = response.data.product;
        feedbacks.value = response.data.feedback;
        // Chuyển object `order` thành array
        const ordersArray = Object.values(response.data.order);
        orders.value = ordersArray.filter(
            (order) =>
                order.TrangThaiDon !== "Đã giao thành công" &&
                order.TrangThaiDon !== "Đơn hàng đã hủy" &&
                order.TrangThaiDon !== "Đã trả hàng"
        );
    } catch (err) {
        console.log("Error fetching: ", err);
    }
};

// Đăng ký các thành phần của Chart.js
ChartJS.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    PointElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    LineElement
);

const chartData = ref(null);
const selectedYear = ref(new Date().getFullYear());
const chartOptions = ref({
    responsive: true,
    plugins: {
        legend: {
            position: "top",
            labels: {
                font: {
                    size: 12,
                    weight: "bold",
                    color: "#333",
                },
            },
        },
        title: {
            display: true,
            text: "Thống kê doanh thu từng tháng trong năm",
            font: {
                size: 16,
                weight: "bold",
                textTransform: "uppercase",
            },
            color: "#333",
        },
        tooltip: {
            callbacks: {
                label: function (context) {
                    const value = context.raw;
                    const formattedValue = value
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                    return `${context.dataset.label}: ${formattedValue} đ`;
                },
            },
        },
    },
});

const totalRevenueYear = ref("");
const fetchRevenueData = async (year) => {
    if (year > new Date().getFullYear()) {
        showNotification("Năm tìm kiếm không hợp lệ!", "error");
        setTimeout(() => {
            notification.value.message = "";
        }, 3000);
        return;
    }
    try {
        const response = await axios.get(
            `http://localhost:3000/api/thongke/donhangtheonam?year=${year}`
        );
        totalRevenueYear.value = response.data.tongDoanhThu
        chartData.value = {
            labels: response.data.labels,
            datasets: [
                {
                    label: `Doanh thu năm ${year}`,
                    data: response.data.datasets[0].data,
                    borderColor: "rgba(245, 121, 197, 1)",
                    backgroundColor: "rgba(245, 121, 197, 0.2)",
                    borderWidth: 2,
                    tension: 0.3,
                },
            ],
        };
    } catch (err) {
        console.error("Lỗi khi lấy dữ liệu doanh thu:", err);
    }
};

const chartDataDay = ref(null);
const selectedYearofDay = ref(new Date().getFullYear());
const selectedMonthOfDay = ref(new Date().getMonth() + 1);
const totalRevenueMonth = ref("");

const chartDayOptions = ref({
    responsive: true,
    plugins: {
        legend: {
            position: "top",
            labels: {
                font: {
                    size: 14,
                    weight: "bold",
                    color: "#333",
                },
            },
        },
        title: {
            display: true,
            text: "Thống kê doanh thu từng ngày trong tháng",
            font: {
                size: 16,
                weight: "bold",
                textTransform: "uppercase",
            },
            color: "#444",
        },
        tooltip: {
            callbacks: {
                label: function (context) {
                    const value = context.raw;
                    const formattedValue = value
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                    return `${context.dataset.label}: ${formattedValue} đ`;
                },
            },
        },
    },
});

//function fetch lợi nhuận
const fetchMonthlyProfit = async (year, month) => {
    try {
        let url = "http://localhost:3000/api/thongke/loinhuan";

        if (year && month) {
            url += `?year=${year}&month=${month}`;
        } else if (year) {
            url += `?year=${year}`;
        }

        const response = await axios.get(url);

        if (response.data.success) {
            monthlyProfit.value = response.data.data;
        }
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu lợi nhuận:", error);
        monthlyProfit.value = {
            loiNhuan: 0,
            loiNhuanFormatted: "0",
            doanhThuFormatted: "0",
            tyLeLoiNhuan: "0%",
            soDonHang: 0
        };
    }
};

const fetchRevenueDay = async (year, month) => {
    if (year > new Date().getFullYear()) {
        showNotification("Năm tìm kiếm không hợp lệ!", "error");
        setTimeout(() => {
            notification.value.message = "";
        }, 3000);
        return;
    }
    try {
        const response = await axios.get(
            `http://localhost:3000/api/thongke/donhangtheothang?year=${year}&month=${month}`
        );
        totalRevenueMonth.value = response.data.tongDoanhThu;

        chartDataDay.value = {
            labels: response.data.labels,
            datasets: [
                {
                    label: `Doanh thu tháng ${month}/${year}`,
                    data: response.data.datasets[0].data,
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
            ],
        };
        await fetchMonthlyProfit(year, month);
    } catch (err) {
        console.error("Lỗi khi lấy dữ liệu doanh thu theo ngày:", err);
    }
};

const orderStatusChartData = ref(null);
const fetchOrderStatusData = async () => {
    try {
        const response = await axios.get(
            "http://localhost:3000/api/thongke/trangthaidonhang"
        );
        const data = response.data;
        orderStatusChartData.value = {
            labels: data.map((item) => item._id),
            datasets: [
                {
                    label: "Số lượng đơn hàng",
                    data: data.map((item) => item.count),
                    backgroundColor: [
                        "#113F67",
                        "#34699A",
                        "#58A0C8",
                        "#FDF5AA",
                        "rgba(5, 155, 255, 0.5)",
                    ],
                },
            ],
        };
    } catch (err) {
        console.error("Lỗi khi lấy dữ liệu trạng thái đơn hàng:", err);
    }
};

const feedbackStatusChartData = ref(null);
const starCounts = ref({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, Toxic: 0 });

const fetchFeedBackProducts = async () => {
    try {
        const response = await axios.get("http://localhost:3000/api/thongke/danhgiasanpham");
        const data = response.data;

        starCounts.value = {
            ...data.starCounts,
            Toxic: data.toxicCount
        };

        feedbackStatusChartData.value = {
            labels: [
                ...Object.keys(data.starCounts).map(star => `${star} sao`),
                'Bình luận tiêu cực'
            ],
            datasets: [{
                label: "Tổng đánh giá",
                data: [
                    ...Object.values(data.starCounts),
                    data.toxicCount
                ],
                backgroundColor: [
                    "#58A0C8",
                    "#273F4F",
                    "#447D9B",
                    "#D7D7D7",
                    "#0F828C",
                    "#78B9B5"
                ]
            }]
        };
    } catch (err) {
        console.error("Lỗi khi lấy dữ liệu thống kê:", err);
    }
};

const fetchTopSellingProducts = async () => {
    try {
        const response = await axios.get(
            "http://localhost:3000/api/thongke/topluotban"
        );
        listSelling.value = response.data.map((product) => {
            return {
                ...product,
            };
        });
        console.log(listSelling.value)
    } catch (err) {
        console.log("Error fetching sellings products:", err);
    }
};

const selectedProduct = ref('');
const listWarehouse = ref({});
const selectedMonthProduct = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const selectedYearProduct = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());
const selectedNameProduct = ref('');
const filterYear = ref("");
const filterMonth = ref("");
const fetchEnterWarehouse = async (maSanPham, year, month) => {
    if (year > new Date().getFullYear()) {
        showNotification("Năm tìm kiếm không hợp lệ!", "error");
        setTimeout(() => {
            notification.value.message = "";
        }, 3000);
        return;
    }

    try {
        const response = await axios.get(`http://localhost:3000/api/thongke/nhapxuatton/${maSanPham}?year=${year}&month=${month}`);
        listWarehouse.value = response.data;
        const product = listProducts.value.find(p => p.MaSanPham === maSanPham);
        selectedNameProduct.value = product.TenSanPham;
    } catch (error) {
        console.log("Error fetching enter warehouse:", error.message);
    }
};

const exportTopProductPDF = () => {
    showConfirmDialog({
        title: 'Thông báo xác nhận',
        message: 'Bạn có muốn xuất báo cáo TOP sản phẩm mua nhiều nhất không?',
        type: 'info',
        confirmText: 'Xuất báo cáo',
        cancelText: 'Hủy bỏ',
        onConfirm: () => {
            try {
                // Tạo nội dung sản phẩm dạng card layout
                const productContent = listSelling.value.map((product, index) => {
                    const rank = index + 1;
                    const rankColor = rank <= 3 ? '#FFD700' : '#E0E0E0'; // Vàng cho top 3, xám cho còn lại
                    
                    return [
                        // Header của mỗi sản phẩm
                        {
                            columns: [
                                {
                                    width: 60,
                                    stack: [
                                        {
                                            text: `#${rank}`,
                                            style: 'rankNumber',
                                            background: rankColor,
                                            color: rank <= 3 ? '#000' : '#666',
                                            alignment: 'center',
                                            margin: [0, 5, 0, 5]
                                        }
                                    ]
                                },
                                {
                                    width: '*',
                                    stack: [
                                        {
                                            text: product.TenSanPham,
                                            style: 'productName',
                                            margin: [10, 0, 0, 2]
                                        },
                                        {
                                            text: `Mã: ${product.MaSanPham}`,
                                            style: 'productCode',
                                            margin: [10, 0, 0, 5]
                                        }
                                    ]
                                }
                            ],
                            margin: [0, 5, 0, 0]
                        },
                        // Thông tin chi tiết sản phẩm
                        {
                            columns: [
                                {
                                    width: '50%',
                                    stack: [
                                        {
                                            columns: [
                                                { text: 'Giá bán:', style: 'labelText', width: 60 },
                                                { 
                                                    text: `${formatCurrency(product.GiaBan)} đ`, 
                                                    style: 'priceText',
                                                    width: '*'
                                                }
                                            ],
                                            margin: [20, 2, 0, 2]
                                        },
                                        {
                                            columns: [
                                                { text: 'Giá Sale:', style: 'labelText', width: 60 },
                                                { 
                                                    text: (product.GiaSale && product.GiaSale > 0) ? `${formatCurrencySale(product.GiaSale)} đ` : 'Không có',
                                                    style: (product.GiaSale && product.GiaSale > 0) ? 'salePriceText' : 'noSaleText',
                                                    width: '*'
                                                }
                                            ],
                                            margin: [20, 2, 0, 2]
                                        }
                                    ]
                                },
                                {
                                    width: '50%',
                                    stack: [
                                        {
                                            columns: [
                                                { text: 'Tình trạng:', style: 'labelText', width: 70 },
                                                { 
                                                    text: product.TrangThai,
                                                    style: product.TrangThai === 'Đang bán' ? 'statusAvailable' : 'statusUnavailable',
                                                    width: '*'
                                                }
                                            ],
                                            margin: [20, 2, 0, 2]
                                        },
                                        {
                                            columns: [
                                                { text: 'Lượt bán:', style: 'labelText', width: 70 },
                                                { 
                                                    text: `${product.LuotBan} sản phẩm`,
                                                    style: 'soldCountText',
                                                    width: '*'
                                                }
                                            ],
                                            margin: [20, 2, 0, 2]
                                        }
                                    ]
                                }
                            ],
                            margin: [0, 5, 0, 10]
                        },
                        // Đường phân cách
                        {
                            canvas: [
                                {
                                    type: 'line',
                                    x1: 0, y1: 0,
                                    x2: 515, y2: 0,
                                    lineWidth: 1,
                                    lineColor: '#E0E0E0'
                                }
                            ],
                            margin: [0, 5, 0, 15]
                        }
                    ];
                }).flat(); // Flatten array để có danh sách phẳng các elements

                const docDefinition = {
                    pageSize: 'A4',
                    pageMargins: [40, 60, 40, 60],
                    content: [
                        // Header
                        {
                            stack: [
                                { text: 'QUẢN LÝ SẢN PHẨM', style: 'header' },
                                { text: 'Hệ thống bán hàng C3 GUNDAM STORE', style: 'subheader' },
                                { text: 'Địa chỉ: Đường 96 - Tân Phú - TX.Long Mỹ - Hậu Giang', style: 'subheader' },
                                {
                                    canvas: [
                                        {
                                            type: 'line',
                                            x1: 0, y1: 0,
                                            x2: 515, y2: 0,
                                            lineWidth: 2,
                                            lineColor: '#333'
                                        }
                                    ],
                                    margin: [0, 10, 0, 10]
                                }
                            ],
                            margin: [0, 0, 0, 20]
                        },
                        
                        // Title
                        { 
                            text: 'BÁO CÁO TOP SẢN PHẨM ĐƯỢC MUA NHIỀU NHẤT', 
                            style: 'title',
                            margin: [0, 0, 0, 5]
                        },
                        { 
                            text: `Ngày xuất: ${formatDate(new Date())}`, 
                            style: 'dateInfo',
                            margin: [0, 0, 0, 20]
                        },

                        // Thống kê tổng quan
                        {
                            columns: [
                                {
                                    width: '50%',
                                    stack: [
                                        { text: 'TỔNG SẢN PHẨM', style: 'statLabel' },
                                        { text: listSelling.value.length.toString(), style: 'statNumber' }
                                    ],
                                    alignment: 'center'
                                },
                                {
                                    width: '50%',
                                    stack: [
                                        { text: 'TỔNG LƯỢT BÁN', style: 'statLabel' },
                                        { 
                                            text: listSelling.value.reduce((sum, p) => sum + p.LuotBan, 0).toString(), 
                                            style: 'statNumber' 
                                        }
                                    ],
                                    alignment: 'center'
                                }
                            ],
                            margin: [0, 0, 0, 25]
                        },

                        // Tiêu đề danh sách
                        { 
                            text: 'DANH SÁCH CHI TIẾT', 
                            style: 'sectionHeader',
                            margin: [0, 0, 0, 15]
                        },

                        // Nội dung sản phẩm
                        ...productContent,

                        // Footer
                        {
                            stack: [
                                {
                                    canvas: [
                                        {
                                            type: 'line',
                                            x1: 0, y1: 0,
                                            x2: 515, y2: 0,
                                            lineWidth: 1,
                                            lineColor: '#333'
                                        }
                                    ],
                                    margin: [0, 20, 0, 10]
                                },
                                { 
                                    text: 'Ghi chú: Danh sách được sắp xếp theo số lượng bán từ cao xuống thấp', 
                                    style: 'note',
                                    margin: [0, 0, 0, 5]
                                },
                                { 
                                    text: `Thời gian xuất báo cáo: ${new Date().toLocaleString('vi-VN')}`, 
                                    style: 'footer'
                                }
                            ]
                        }
                    ],
                    styles: {
                        header: { 
                            fontSize: 20, 
                            bold: true, 
                            alignment: 'center',
                            color: '#333'
                        },
                        subheader: { 
                            fontSize: 11, 
                            alignment: 'center',
                            color: '#666',
                            margin: [0, 2, 0, 2]
                        },
                        title: { 
                            fontSize: 18, 
                            bold: true, 
                            alignment: 'center',
                            color: '#2c3e50'
                        },
                        dateInfo: { 
                            fontSize: 12, 
                            alignment: 'center',
                            color: '#7f8c8d'
                        },
                        sectionHeader: { 
                            fontSize: 14, 
                            bold: true,
                            color: '#34495e',
                            background: '#ecf0f1',
                            margin: [0, 5, 0, 5]
                        },
                        statLabel: {
                            fontSize: 10,
                            color: '#7f8c8d',
                            bold: true
                        },
                        statNumber: {
                            fontSize: 16,
                            color: '#2c3e50',
                            bold: true,
                            margin: [0, 2, 0, 0]
                        },
                        rankNumber: {
                            fontSize: 16,
                            bold: true,
                            border: [1, 1, 1, 1],
                            borderColor: '#bdc3c7'
                        },
                        productName: {
                            fontSize: 13,
                            bold: true,
                            color: '#2c3e50'
                        },
                        productCode: {
                            fontSize: 10,
                            color: '#7f8c8d',
                            italics: true
                        },
                        labelText: {
                            fontSize: 10,
                            color: '#7f8c8d',
                            bold: true
                        },
                        priceText: {
                            fontSize: 11,
                            color: '#27ae60',
                            bold: true
                        },
                        salePriceText: {
                            fontSize: 11,
                            color: '#e74c3c',
                            bold: true
                        },
                        noSaleText: {
                            fontSize: 10,
                            color: '#95a5a6',
                            italics: true
                        },
                        statusAvailable: {
                            fontSize: 10,
                            color: '#27ae60',
                            bold: true
                        },
                        statusUnavailable: {
                            fontSize: 10,
                            color: '#e74c3c',
                            bold: true
                        },
                        soldCountText: {
                            fontSize: 11,
                            color: '#3498db',
                            bold: true
                        },
                        note: { 
                            fontSize: 9, 
                            italics: true,
                            color: '#7f8c8d'
                        },
                        footer: { 
                            fontSize: 9, 
                            alignment: 'right',
                            color: '#95a5a6'
                        }
                    }
                };

                const fileName = `BaoCao_TopSanPham_${new Date().toISOString().split('T')[0]}.pdf`;
                pdfMake.createPdf(docDefinition).download(fileName);
                showNotification('Xuất báo cáo TOP sản phẩm thành công!', 'success');
            } catch (error) {
                console.error('Lỗi khi xuất PDF:', error);
                showNotification('Lỗi khi xuất báo cáo PDF!', 'error');
            }
        }
    });
};

function formatCurrency(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

function formatCurrencySale(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' };
    const formattedDate = date.toLocaleDateString('vi-VN', options);

    return formattedDate;
};

onMounted(() => {
    fetchListProducts();
    fetchStatistical();
    fetchRevenueData(new Date().getFullYear());
    fetchOrderStatusData();
    fetchFeedBackProducts();
    fetchRevenueDay(new Date().getFullYear(), new Date().getMonth() + 1);
    fetchTopSellingProducts();
    fetchMonthlyProfit();
});
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full h-screen font-sans flex">
        <SideBar />
        <div class="flex-1 flex flex-col h-screen overflow-hidden">
            <div class="flex-shrink-0 p-4">
                <Navbar />
            </div>
            <div class="flex-1 px-4 pb-4 overflow-y-auto">
                <div class="flex flex-col gap-6">
                    <div class="flex gap-4 w-full lg:flex-row flex-col">
                        <div class="text-white rounded-md shadow-lg bg-[#DB3F4C] w-full lg:w-[25%]">
                            <div class="flex justify-between px-4 pt-4 w-full items-center">
                                <i class="fa-solid fa-igloo text-[30px]"></i>
                                <div class="flex flex-col items-end">
                                    <p class="text-[24px] font-bold">{{ products.length }}</p>
                                    <p class="text-[14px] font-semibold">Sản phẩm trong kho</p>
                                </div>
                            </div>
                            <div class="mt-6 w-full text-center bg-[#333]/30 rounded-b-md p-2 cursor-pointer">
                                <router-link to="/admin/adminProducts" class="font-semibold text-[12px] w-full">Xem chi
                                    tiết</router-link>
                            </div>
                        </div>
                        <div class="text-white rounded-md shadow-lg bg-[#4C47AF] w-full lg:w-[25%]">
                            <div class="flex justify-between px-4 pt-4 w-full items-center">
                                <i class="fa-solid fa-bag-shopping text-[30px]"></i>
                                <div class="flex flex-col items-end">
                                    <p class="text-[24px] font-bold">{{ orders.length }}</p>
                                    <p class="text-[14px] font-semibold">Đơn hàng đang xử lý</p>
                                </div>
                            </div>
                            <div class="mt-6 w-full text-center bg-[#333]/30 rounded-b-md p-2">
                                <router-link to="/admin/listOrders" class="font-semibold text-[12px]">Xem chi
                                    tiết</router-link>
                            </div>
                        </div>
                        <div class="text-white rounded-md shadow-lg bg-[#DA70D6] w-full lg:w-[25%]">
                            <div class="flex justify-between px-4 pt-4 w-full items-center">
                                <i class="fa-solid fa-comments text-[30px]"></i>
                                <div class="flex flex-col items-end">
                                    <p class="text-[24px] font-bold">{{ feedbacks.length }}</p>
                                    <p class="text-[14px] font-semibold">Đánh giá sản phẩm</p>
                                </div>
                            </div>
                            <div class="mt-6 w-full text-center bg-[#333]/30 rounded-b-md p-2">
                                <router-link to="/admin/listFeedBacks" class="font-semibold text-[12px]">Xem chi
                                    tiết</router-link>
                            </div>
                        </div>
                        <div class="text-white rounded-md shadow-lg bg-[#008B8B] w-full lg:w-[25%]">
                            <div class="flex justify-between px-4 pt-4 w-full items-center">
                                <i class="fa-solid fa-users text-[30px]"></i>
                                <div class="flex flex-col items-end">
                                    <p class="text-[24px] font-bold">{{ customers.length }}</p>
                                    <p class="text-[14px] font-semibold">
                                        Khách hàng đã tham gia
                                    </p>
                                </div>
                            </div>
                            <div class="mt-6 w-full text-center bg-[#333]/30 rounded-b-md p-2">
                                <router-link to="/admin/customers" class="font-semibold text-[12px]">Xem chi
                                    tiết</router-link>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-4">
                        <div class="flex justify-between items-center lg:flex-row flex-col gap-4">
                            <h3 class="font-bold text-[16px] lg:text-[20px] uppercase lg:text-start text-center">
                                Top sản phẩm bán chạy nhất
                            </h3>
                            <button @click="exportTopProductPDF"
                                class="bg-[#003171] text-white px-3 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2">
                                Xuất File Top Sản Phẩm</button>
                        </div>
                        <div class="flex flex-col gap-4 p-4 bg-white shadow-lg rounded-md border-2">
                            <div v-for="(product, index) in listSelling" :key="index"
                                class="flex gap-4 items-center border-b-2 pb-4">
                                <div
                                    class="border-4 border-[#1A1D27] rounded-full w-[40px] h-[40px] flex justify-center items-center">
                                    <p class="font-bold text-[18px] text-gray-600">
                                        {{ index + 1 }}
                                    </p>
                                </div>
                                <div class="flex gap-4 items-center">
                                    <img :src="product.Images[0]" class="rounded-md w-[70px] border-2 border-[#1A1D27]"
                                        alt="" />
                                    <div>
                                        <div
                                            class="whitespace-nowrap text-ellipsis overflow-hidden w-[150px] lg:w-full">
                                            <p
                                                class="font-semibold text-[16px] overflow-hidden text-ellipsis whitespace-nowrap">
                                                {{ product.TenSanPham }}
                                            </p>
                                        </div>
                                        <p class="text-[14px] font-semibold">
                                            Đã bán:
                                            <span class="font-medium">{{ product.LuotBan }} sản phẩm</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-3">
                        <div class="flex gap-4 items-center lg:flex-row flex-col w-full">
                            <h3
                                class="font-bold text-[16px] lg:text-[20px] uppercase w-full lg:w-[50%] lg:text-start text-center">
                                Thống kê nhập xuất tồn tháng {{ filterMonth }}
                            </h3>
                            <div class="flex items-center gap-4 flex-col lg:flex-row w-full">
                                <select v-model="selectedProduct"
                                    @change="fetchEnterWarehouse(selectedProduct, filterYear, filterMonth)"
                                    class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold lg:w-1/3 w-full focus:ring focus:ring-[#1A1D27]">
                                    <option disabled value="">Chọn sản phẩm</option>
                                    <option v-for="(product, index) in listProducts" :key="index"
                                        :value="product.MaSanPham">
                                        {{ index + 1 }}. {{ product.TenSanPham }}
                                    </option>
                                </select>
                                <select v-model="filterYear"
                                    @change="fetchEnterWarehouse(selectedProduct, filterYear, filterMonth)"
                                    class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold lg:w-1/3 w-full focus:ring focus:ring-[#1A1D27]">
                                    <option disabled value="">Chọn năm</option>
                                    <option v-for="year in selectedYearProduct" :key="year" :value="year">
                                        Năm {{ year }}
                                    </option>
                                </select>
                                <select v-model="filterMonth"
                                    @change="fetchEnterWarehouse(selectedProduct, filterYear, filterMonth)"
                                    class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold lg:w-1/3 w-full focus:ring focus:ring-[#1A1D27]">
                                    <option disabled value="">Chọn tháng</option>
                                    <option v-for="month in selectedMonthProduct" :key="month" :value="month">
                                        Tháng {{ month }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1 p-4 rounded-md shadow bg-white border-2">
                            <p class="text-[14px] font-semibold text-gray-600">
                                {{ selectedNameProduct ? selectedNameProduct : "Chọn sản phẩm cần thống kê" }}
                            </p>
                            <div class="flex gap-2 lg:gap-8 mt-2 lg:flex-row flex-col">
                                <p class="font-semibold text-[15px]">Số lượng nhập vào: {{ listWarehouse.SoLuongNhap ?
                                    listWarehouse.SoLuongNhap : 0 }}</p>
                                <p class="font-semibold text-[15px]">Số lượng bán ra: {{ listWarehouse.SoLuongBan ?
                                    listWarehouse.SoLuongBan : 0 }}</p>
                                <p class="font-semibold text-[15px]">Số lượng tồn kho: {{ listWarehouse.SoLuongTon ?
                                    listWarehouse.SoLuongTon : 0 }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-3">
                        <div class="flex gap-4 items-center lg:flex-row flex-col">
                            <h3
                                class="font-bold text-[16px] lg:text-[20px] uppercase w-full lg:w-[50%] lg:text-start text-center">
                                Thống kê doanh thu của tháng {{ selectedMonthOfDay }}
                            </h3>
                            <div class="flex items-center gap-4 flex-col lg:flex-row w-full">
                                <input type="number" v-model="selectedYearofDay" min="2000" max="2100"
                                    class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold lg:w-[200px] w-full focus:ring focus:ring-[#1A1D27]"
                                    @change="
                                        fetchRevenueDay(selectedYearofDay, selectedMonthOfDay)
                                        " placeholder="Nhập năm ..." />
                                <select v-model="selectedMonthOfDay"
                                    class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold lg:w-[150px] w-full focus:ring focus:ring-[#1A1D27]"
                                    @change="
                                        fetchRevenueDay(selectedYearofDay, selectedMonthOfDay)
                                        ">
                                    <option disabled value="">Chọn tháng</option>
                                    <option v-for="month in 12" :key="month" :value="month">
                                        Tháng {{ month }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1 p-4 rounded-md shadow bg-white border-2">
                            <div class="flex justify-between items-center">
                                <div>
                                    <p class="text-[14px] font-semibold text-gray-600">Tổng doanh thu</p>
                                    <p class="text-[24px] font-bold">
                                        {{ formatCurrency(totalRevenueMonth.toString()) }}
                                        <span class="text-[24px] relative -top-[2px] underline">đ</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="w-full bg-white shadow-lg rounded-md p-4 border-2">
                            <Bar v-if="chartDataDay" :data="chartDataDay" :options="chartDayOptions" />
                        </div>
                    </div>
                    <div class="flex lg:flex-row flex-col gap-4 w-full items-center">
                        <div class="flex flex-col gap-3 w-full lg:w-1/2">
                            <h3 class="font-bold text-[16px] lg:text-[20px] uppercase lg:text-start text-center">
                                Thống kê đơn hàng
                            </h3>
                            <div class="w-full bg-white shadow-lg rounded-md p-4 border-2">
                                <div class="lg:w-[350px] lg:h-[350px] w-[250px] h-[250px] m-auto">
                                    <Doughnut v-if="orderStatusChartData" :data="orderStatusChartData" />
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col gap-3 w-full lg:w-1/2">
                            <h3 class="font-bold text-[16px] lg:text-[20px] uppercase lg:text-start text-center">
                                Thống kê đánh giá sản phẩm
                            </h3>
                            <div class="w-full bg-white shadow-lg rounded-md p-4 border-2">
                                <div class="lg:w-[350px] lg:h-[350px] w-[200px] h-[200px] m-auto">
                                    <Doughnut v-if="feedbackStatusChartData" :data="feedbackStatusChartData" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-3">
                        <div class="flex gap-4 items-center lg:flex-row flex-col">
                            <h3 class="font-bold text-[16px] lg:text-[20px] uppercase lg:text-start text-center">
                                Thống kê doanh thu theo năm
                            </h3>
                            <input type="number" v-model="selectedYear" min="2000" max="2100"
                                class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full lg:w-[200px] focus:ring focus:ring-[#1A1D27]"
                                @change="fetchRevenueData(selectedYear)" placeholder="Nhập năm ..." />
                        </div>
                        <div class="flex flex-col gap-1 p-4 rounded-md shadow bg-white border-2">
                            <div class="flex justify-between items-center">
                                <div>
                                    <p class="text-[14px] font-semibold text-gray-600">Tổng doanh thu</p>
                                    <p class="text-[24px] font-bold">
                                        {{ formatCurrency(totalRevenueYear.toString()) }}
                                        <span class="text-[24px] relative -top-[2px] underline">đ</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="w-full bg-white shadow-lg rounded-md p-4 border-2">
                            <Line v-if="chartData" :data="chartData" :options="chartOptions" />
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
    background: #db3f4c;
    color: white;
}
</style>