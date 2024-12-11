<script setup>
import { ref, onMounted, computed } from "vue"
import Header_Home from "@/components/client/Header_Home.vue";
import Footer from "@/components/client/Footer.vue";
import BackToTop from "@/components/client/BackToTop.vue";

const listChoices = [
    {
        name: "TẤT CẢ SẢN PHẨM",
        type: "All",
    },
    {
        name: "MG - HIRM - RE/100 - 1/100",
        type: "MG",
    },
    {
        name: "PG 1/60 - MEGA SIZE 1/48",
        type: "PG",
    },
    {
        name: "RG - REAL GRADE 1/144",
        type: "RG",
    },
]

const listProducts = ref([
    {
        name: "SD WORLD HEROES 16 SEITEN TAISEI GOKU QITIAN DASHENG IMPULSE GUNDAM DOUZHAN SHENGFO WUKONG SDWH",
        price: "250.000 VNĐ",
        img: "/src/assets/img/SD04.jpg",
        type: "MG"
    },
    {
        name: "SD WORLD HEROES 25 LEIF GUNDAM GP04 SDWH",
        price: "220.000 VNĐ",
        img: "/src/assets/img/SD03.jpg",
        type: "PG"
    },
    {
        name: "SD WORLD HEROES 36 Onmitsu Gundam Aerial SDWH",
        price: "300.000 VNĐ",
        img: "/src/assets/img/SD01.jpg",
        type: "RG"
    },
    {
        name: "SDCS F-KUNOICHI KAI F9 No.1 (Gundam Build Metaverse) HGBM",
        price: "340.000 VNĐ",
        img: "/src/assets/img/SD02.jpg",
        type: "RG"
    },
    {
        name: "MG 1/100 ZGMF-X20A Strike Freedom Gundam",
        price: "1.050.000 VNĐ",
        img: "/src/assets/img/MG01.jpg",
        type: "MG"
    },
    {
        name: "MG 1/100 GUNDAM EX IMPULSE [P-Bandai]",
        price: "1.080.000 VNĐ",
        img: "/src/assets/img/MG02.jpg",
        type: "MG"
    },
    {
        name: "FULL MECHANICS 1/100 XVX-016 GUNDAM AERIAL",
        price: "1.000.000 VNĐ",
        img: "/src/assets/img/MG03.jpg",
        type: "MG"
    },
    {
        name: "MG 1/100 GUNDAM ASTRAY RED FRAME FLIGHT UNIT [P-BANDAI]",
        price: "1.900.000 VNĐ",
        img: "/src/assets/img/MG04.jpg",
        type: "MG"
    },
    {
        name: "PG 1/60 RX-0 UNICORN GUNDAM FINAL BATTLE VER [P-BANDAI]",
        price: "9.000.000 VNĐ",
        img: "/src/assets/img/PG01.jpg",
        type: "PG"
    },
    {
        name: "PG 1/60 GAT - X105 + AQME-YM1 PERFECT STRIKE GUNDAM",
        price: "5.500.000 VNĐ",
        img: "/src/assets/img/PG02.jpg",
        type: "PG"
    },
    {
        name: "PG 1/60 RX-0 UNICORN GUNDAM PERFECTIBILITY [P-Bandai]",
        price: "10.500.000 VNĐ",
        img: "/src/assets/img/PG03.jpg",
        type: "PG"
    },
    {
        name: "PG 1/60 MBF-P02 GUNDAM ASTRAY RED FRAME",
        price: "4.500.000 VNĐ",
        img: "/src/assets/img/PG04.jpg",
        type: "PG"
    },
    {
        name: "RG 1/144 ZGMF-X20A STRIKE FREEDOM GUNDAM (TITANIUM FINISH) [P-Bandai]",
        price: "2.350.000 VNĐ",
        img: "/src/assets/img/RG01.jpg",
        type: "RG"
    },
    {
        name: "RG 18 1/144 00 RAISER",
        price: "800.000 VNĐ",
        img: "/src/assets/img/RG02.jpg",
        type: "RG"
    },
    {
        name: "RG 1/144 RX-0 UNICORN GUNDAM (BILIBILI 10TH ANNIVERSARY VER)",
        price: "2.050.000 VNĐ",
        img: "/src/assets/img/RG03.jpg",
        type: "RG"
    },
    {
        name: "RG 09 1/144 JUSTICE GUNDAM",
        price: "580.000 VNĐ",
        img: "/src/assets/img/RG04.jpg",
        type: "RG"
    },
]);

const searchQuery = ref("");
const selectedType = ref("All");
const selectTypeProducts = (type) => {
  selectedType.value = type;
};

const handleSearch = (query) => {
  searchQuery.value = query;
};

const filteredProducts = computed(() => {
  return listProducts.value.filter(product => {
    const matchesType = selectedType.value === "All" || product.type === selectedType.value;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesType && matchesSearch;
  });
});
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth">
        <Header_Home @search="handleSearch" />
        <div class="w-full bg-[#DB3F4C]">
            <div
                class="flex lg:flex-row flex-col justify-center items-center lg:justify-between w-full p-5 lg:px-[210px]">
                <div class="flex flex-col gap-3 w-full lg:w-[50%] justify-center lg:justify-start items-start">
                    <p class="bg-[rgba(52,52,52,0.7)] text-white text-[14px] px-3 py-2 font-medium rounded-md">C3 GUNDAM
                        STORE</p>
                    <p class="text-white font-semibold uppercase text-[26px]">C3 GUNDAM STORE - Gắn kết đam mê, xây dựng
                        thế giới Gundam của riêng bạn.</p>
                    <span class="lg:w-[150px] w-full h-1 bg-white"></span>
                    <p class="text-white text-[14px] font-medium">Cửa hàng Gundam không chỉ là nơi bày bán mô hình, mà
                        còn là không gian nuôi dưỡng đam mê, nơi giấc mơ về những chiến binh cơ khí trở thành hiện thực.
                    </p>
                    <p class="text-white text-[14px] font-semibold">Địa chỉ: Đường 96 - Tân Phú - TX.Long Mỹ - Hậu Giang
                    </p>
                </div>
                <div class="w-full lg:w-[50%] flex justify-end">
                    <img src="../../assets/img/banner.png" class="w-[350px]" alt="">
                </div>
            </div>
        </div>
        <div
            class="my-2 bg-gradient-to-b text-center lg:text-start from-[rgba(219,63,76,0.7)] to-[#1A1D27] p-5 lg:mx-[210px]">
            <p class="text-white font-semibold uppercase text-[22px] lg:text-[26px]">Vũ trụ Gundam thu nhỏ trong từng mô
                hình, chỉ có tại C3 GUNDAM.</p>
            <p class="text-white font-medium my-1">Tại đây bạn có thể chọn được những mẫu Gundam yêu thích chính hãng từ
                BANDAI NAMCO.</p>
        </div>
        <div class="my-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 m-5 lg:mx-[210px]">
            <button v-for="(choice, index) in listChoices" :key="index" @click.prevent="selectTypeProducts(choice.type)"
                class="w-full bg-gradient-to-b text-center flex flex-col gap-2 lg:text-start from-[rgba(219,63,76,0.7)] to-[#1A1D27] p-4">
                <p class="text-[18px] font-semibold text-white">{{ choice.name }}</p>
                <span class="lg:w-[100px] w-full h-[2px] bg-white"></span>
                <p class="text-[14px] text-white font-medium">> Hiển thị tất cả</p>
            </button>
        </div>
        <div class="mt-10 mb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 m-5 lg:mx-[210px]">
            <div v-for="(product, index) in filteredProducts" :key="index" class="flex flex-col gap-3 items-center">
                <router-link to="">
                    <img :src="product.img" class="w-full [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]" alt="">
                </router-link>
                <router-link to=""
                    class="text-white text-[14px] text-center flex-grow hover:text-[#DB3F4C] transition-all duration-300">{{
                    product.name }}</router-link>
                <p class="text-white text-[14px]">Giá: <span class="text-[#FFD700]">{{ product.price }}</span></p>
                <button class="px-5 py-2 w-full rounded-md bg-[#DB3F4C] text-white font-medium">Thêm giỏ hàng</button>
            </div>
        </div>
        <Footer />
        <BackToTop />
    </div>
</template>

<style></style>