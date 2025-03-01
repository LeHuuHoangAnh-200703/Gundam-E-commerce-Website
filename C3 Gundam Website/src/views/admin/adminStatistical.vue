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
    LineElement
} from "chart.js";

const customers = ref([]);
const products = ref([]);
const orders = ref([]);
const feedbacks = ref([]);
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
const fetchStatistical = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/thongke');
        customers.value = response.data.customer;
        products.value = response.data.product;
        feedbacks.value = response.data.feedback;
        // Chuyển object `order` thành array
        const ordersArray = Object.values(response.data.order);
        orders.value = ordersArray.filter(order => order.TrangThaiDon !== "Đã giao thành công" && order.TrangThaiDon !== 'Đơn hàng đã hủy');
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

// Đăng ký các thành phần của Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, PointElement, CategoryScale, LinearScale, ArcElement, LineElement);

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
                    weight: 'bold',
                    color: '#333',
                }
            }
        },
        title: {
            display: true,
            text: "Thống kê doanh thu từng tháng trong năm",
            font: {
                size: 16,
                weight: 'bold',
                textTransform: 'uppercase',
            },
            color: '#333'
        }
    }
});

const fetchRevenueData = async (year) => {
    if (year > new Date().getFullYear()) {
        showNotification("Năm tìm kiếm không hợp lệ!", "error");
        setTimeout(() => {
            notification.value.message = '';
        }, 3000);
        return;
    }
    try {
        const response = await axios.get(
            `http://localhost:3000/api/donhang/thongke/revenue-by-month?year=${year}`
        );

        chartData.value = {
            labels: response.data.labels,
            datasets: [
                {
                    label: `Doanh thu năm ${year}`,
                    data: response.data.datasets[0].data,
                    borderColor: "#1E90FF",
                    backgroundColor: "#00BFFF",
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
                textTransform: 'uppercase',
            },
            color: "#444",
        },
    },
});

const fetchRevenueDay = async (year, month) => {
    if (year > new Date().getFullYear()) {
        showNotification("Năm tìm kiếm không hợp lệ!", "error");
        setTimeout(() => {
            notification.value.message = '';
        }, 3000);
        return;
    }
    try {
        const response = await axios.get(
            `http://localhost:3000/api/donhang/thongke/revenue-by-day?year=${year}&month=${month}`
        );

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
    } catch (err) {
        console.error("Lỗi khi lấy dữ liệu doanh thu theo ngày:", err);
    }
};


const orderStatusChartData = ref(null);
const fetchOrderStatusData = async () => {
    try {
        const response = await axios.get("http://localhost:3000/api/donhang/thongke/get-order-status");
        const data = response.data;
        orderStatusChartData.value = {
            labels: data.map(item => item._id),
            datasets: [
                {
                    label: "Số lượng đơn hàng",
                    data: data.map(item => item.count),
                    backgroundColor: [
                        "#DA70D6",
                        "#36A2EB",
                        "#FFCE56",
                        "#4BC0C0",
                        "rgba(5, 155, 255, 0.5)"
                    ]
                }
            ]
        };
    } catch (err) {
        console.error("Lỗi khi lấy dữ liệu trạng thái đơn hàng:", err);
    }
};

const feedbackStatusChartData = ref(null);
const fetchFeedBackProducts = async () => {
    try {
        const response = await axios.get("http://localhost:3000/api/danhgia/thongke/get-feedback-products");
        const data = response.data;
        console.log(data)
        feedbackStatusChartData.value = {
            labels: data.map(item => `${item._id} sao`),
            datasets: [
                {
                    label: "Tổng đánh giá",
                    data: data.map(item => item.count),
                    backgroundColor: [
                        "#6495ED",
                        "#40E0D0",
                        "#7B68EE",
                        "#EE82EE",
                        "#FFFF00"
                    ]
                }
            ]
        };
    } catch (err) {
        console.error("Lỗi khi lấy dữ liệu trạng thái đơn hàng:", err);
    }
};

onMounted(() => {
    fetchStatistical();
    fetchRevenueData(new Date().getFullYear());
    fetchOrderStatusData();
    fetchFeedBackProducts();
    fetchRevenueDay(new Date().getFullYear(), new Date().getMonth() + 1);
})
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="w-full relative flex flex-col gap-6 overflow-auto max-h-[calc(100vh-100px)] pb-7">
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
                                    <p class="text-[14px] font-semibold">Khách hàng đã tham gia</p>
                                </div>
                            </div>
                            <div class="mt-6 w-full text-center bg-[#333]/30 rounded-b-md p-2">
                                <router-link to="/admin/customers" class="font-semibold text-[12px]">Xem chi
                                    tiết</router-link>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-3">
                        <div class="flex gap-4 items-center">
                            <h3 class="font-bold text-[16px] lg:text-[20px] uppercase">Thống kê doanh thu theo tháng
                            </h3>
                            <div class="flex items-center gap-4">
                                <input type="number" v-model="selectedYearofDay" min="2000" max="2100"
                                    class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-[200px] focus:ring focus:ring-[#1A1D27]"
                                    @change="fetchRevenueDay(selectedYearofDay, selectedMonthOfDay)"
                                    placeholder="Nhập năm ..." />
                                <select v-model="selectedMonthOfDay"
                                    class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-[150px] focus:ring focus:ring-[#1A1D27]"
                                    @change="fetchRevenueDay(selectedYearofDay, selectedMonthOfDay)">
                                    <option disabled value="">Chọn tháng</option>
                                    <option v-for="month in 12" :key="month" :value="month">
                                        Tháng {{ month }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div class="w-full bg-white shadow-lg rounded-md p-4 border-2">
                            <Bar v-if="chartDataDay" :data="chartDataDay" :options="chartDayOptions" />
                        </div>
                    </div>
                    <div class="flex lg:flex-row flex-col gap-4 w-full">
                        <div class="flex flex-col gap-3 w-full lg:w-1/2">
                            <div class="flex gap-4 items-center">
                                <h3 class="font-bold text-[16px] lg:text-[20px] uppercase">Thống kê đơn hàng</h3>
                            </div>
                            <div class="w-full bg-white shadow-lg rounded-md p-4 border-2">
                                <div class="lg:w-[350px] lg:h-[350px] w-[250px] h-[250px] m-auto">
                                    <Pie v-if="orderStatusChartData" :data="orderStatusChartData" />
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col gap-3 w-full lg:w-1/2">
                            <div class="flex gap-4 items-center">
                                <h3 class="font-bold text-[16px] lg:text-[20px] uppercase">Thống kê đánh giá sản phẩm
                                </h3>
                            </div>
                            <div class="w-full bg-white shadow-lg rounded-md p-4 border-2">
                                <div class="lg:w-[350px] lg:h-[350px] w-[200px] h-[200px] m-auto">
                                    <Pie v-if="feedbackStatusChartData" :data="feedbackStatusChartData" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-3">
                        <div class="flex gap-4 items-center">
                            <h3 class="font-bold text-[16px] lg:text-[20px] uppercase">Thống kê doanh thu theo năm</h3>
                            <input type="number" v-model="selectedYear" min="2000" max="2100"
                                class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-[200px] focus:ring focus:ring-[#1A1D27]"
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
    background: #DB3F4C;
    color: white;
}
</style>