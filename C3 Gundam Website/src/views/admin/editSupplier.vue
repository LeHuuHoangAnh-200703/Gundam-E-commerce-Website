<script setup>
import { ref } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="flex lg:flex-row flex-col gap-4 justify-center items-center">
                    <h1 class="font-bold text-[20px]">Chỉnh sửa nhà cung cấp</h1>
                </div>
                <div class="bg-white rounded-lg shadow-lg w-full lg:w-[70%] mx-auto p-4">
                    <form action="">
                        <div class="w-full flex flex-col lg:flex-row gap-8">
                            <div class="w-full flex flex-col gap-4">
                                <div class="flex flex-col gap-2">
                                    <label for="nameSupplier" class="text-[15px] font-semibold">Tên nhà cung cấp</label>
                                    <input type="text" id="nameSupplier"
                                        class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                        placeholder="Nhập tên nhà cung cấp ...">
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label for="phoneSupplier" class="text-[15px] font-semibold">Số điện thoại</label>
                                    <input type="text" id="phoneSupplier"
                                        class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                        placeholder="Nhập số điện thoại ...">
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label for="addressSupplier" class="text-[15px] font-semibold">Địa chỉ</label>
                                    <input type="text" id="addressSupplier"
                                        class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                        placeholder="Nhập địa chỉ ...">
                                </div>
                                <div class="flex justify-center lg:justify-end">
                                    <button type="submit"
                                        class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] transition-all duration-300 hover:bg-[#003171]">Chỉnh sửa
                                        nhà cung cấp</button>
                                </div>
                            </div>
                        </div>
                    </form>
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

.fixed {
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
}

.fixed.translate-x-0 {
    transform: translateX(0);
}
</style>