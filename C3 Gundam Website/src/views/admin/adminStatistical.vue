<script setup>
import { ref, onMounted } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import NotificationAdmin from "@/components/Notification/NotificationAdmin.vue";
import axios from "axios";
import { Bar } from "vue-chartjs";
import { Pie } from "vue-chartjs";
import { Line } from "vue-chartjs";
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
    message: "",
    type: "",
});
const listSelling = ref([]);
const showNotification = (msg, type) => {
    notification.value = { message: msg, type: type };
    setTimeout(() => {
        notification.value.message = "";
    }, 3000);
};

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
                order.TrangThaiDon !== "Đơn hàng đã hủy"
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
                        "#DA70D6",
                        "#36A2EB",
                        "#FFCE56",
                        "#4BC0C0",
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
                    "#6495ED",
                    "#40E0D0",
                    "#7B68EE",
                    "#EE82EE",
                    "#FFFF00",
                    "#DC143C"
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
        console.log(response.data);
        listWarehouse.value = response.data;
        const product = listProducts.value.find(p => p.MaSanPham === maSanPham);
        selectedNameProduct.value = product.TenSanPham;
    } catch (error) {
        console.log("Error fetching enter warehouse:", error.message);
    }
}

function formatCurrency(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatCurrencySale(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

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
                        <h3 class="font-bold text-[16px] lg:text-[20px] uppercase lg:text-start text-center">
                            Top sản phẩm bán chạy nhất
                        </h3>
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
                                    <p class="text-[14px] font-semibold text-gray-600">Tổng đơn hàng: <span class="text-[16px] text-green-700">{{ monthlyProfit.soDonHang }}</span></p>
                                </div>
                                <div class="text-right">
                                    <p class="text-[14px] font-semibold text-gray-600">Tổng lợi nhuận</p>
                                    <p class="text-[24px] font-bold text-green-700">
                                        {{ formatCurrencySale(monthlyProfit.loiNhuan) }}
                                        <span class="text-[24px] relative -top-[2px] underline">đ</span>
                                    </p>
                                    <p class="text-[12px] text-gray-500">
                                        Tỷ lệ: {{ monthlyProfit.tyLeLoiNhuan }}
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
                                    <Pie v-if="orderStatusChartData" :data="orderStatusChartData" />
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col gap-3 w-full lg:w-1/2">
                            <h3 class="font-bold text-[16px] lg:text-[20px] uppercase lg:text-start text-center">
                                Thống kê đánh giá sản phẩm
                            </h3>
                            <div class="w-full bg-white shadow-lg rounded-md p-4 border-2">
                                <div class="lg:w-[350px] lg:h-[350px] w-[200px] h-[200px] m-auto">
                                    <Pie v-if="feedbackStatusChartData" :data="feedbackStatusChartData" />
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
                        <div class="w-full bg-white shadow-lg rounded-md p-4 border-2">
                            <Line v-if="chartData" :data="chartData" :options="chartOptions" />
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
    background: #db3f4c;
    color: white;
}
</style>