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
                <div class="flex lg:flex-row flex-col gap-4 justify-center lg:justify-between items-center">
                    <h1 class="font-bold text-[20px]">Chỉnh sửa sản phẩm</h1>
                </div>
                <div class="bg-white rounded-lg shadow-lg w-full p-4">
                    <form action="">
                        <div class="w-full flex flex-col lg:flex-row gap-8">
                            <div class="lg:w-1/2 w-full flex flex-col gap-4">
                                <div class="flex flex-col gap-2">
                                    <label for="nameProduct" class="text-[15px] font-semibold">Tên sản phẩm</label>
                                    <input type="text" id="nameProduct"
                                        class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                        placeholder="Nhập tên sản phẩm ...">
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label for="priceProduct" class="text-[15px] font-semibold">Giá bán sản phẩm</label>
                                    <input type="text" id="priceProduct"
                                        class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                        placeholder="Nhập giá bán sản phẩm ...">
                                </div>
                                <div class="flex gap-4">
                                    <div class="flex flex-col gap-2 w-full">
                                        <label for="typeProduct" class="text-[15px] font-semibold">Loại sản phẩm</label>
                                        <select
                                            class="p-2 border-2 cursor-pointer text-[#003171] rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            name="" id="typeProduct">
                                            <option value="RG" class="text-[#003171] font-semibold">RG</option>
                                            <option value="MG" class="text-[#003171] font-semibold">MG</option>
                                            <option value="PG" class="text-[#003171] font-semibold">PG</option>
                                        </select>
                                    </div>
                                    <div class="flex flex-col gap-2 w-full">
                                        <label for="brandProduct" class="text-[15px] font-semibold">Thương hiệu</label>
                                        <select
                                            class="p-2 border-2 cursor-pointer text-[#003171] rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            name="" id="brandProduct">
                                            <option value="Premium Bandai" class="text-[#003171] font-semibold">Premium
                                                Bandai</option>
                                            <option value="Gunpla - Gundam Plastic Models"
                                                class="text-[#003171] font-semibold">Gunpla - Gundam Plastic Models
                                            </option>
                                            <option value="Kotobukiya" class="text-[#003171] font-semibold">Kotobukiya
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label for="description" class="text-[15px] font-semibold">Mô tả sản phẩm <i
                                            class="fa-solid fa-circle-info text-gray-300"></i></label>
                                    <textarea type="text" id="description"
                                        class="p-2 border-2 rounded-md text-[14px] h-32 outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                        placeholder="Mô tả sản phẩm ..."></textarea>
                                </div>
                            </div>
                            <div class="lg:w-1/2 w-full flex flex-col gap-4">
                                <div class="flex flex-col gap-2">
                                    <label for="priceProduct" class="text-[15px] font-semibold">Giá bán sản phẩm</label>
                                    <input type="text" id="priceProduct"
                                        class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                        placeholder="Nhập giá bán sản phẩm ...">
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label for="imageUpload" class="text-[15px] font-semibold">Hình ảnh sản phẩm <i
                                            class="fa-solid fa-circle-info text-gray-300"></i></label>
                                    <div class="flex flex-col lg:flex-row gap-3">
                                        <div class="flex flex-col lg:flex-row gap-3">
                                            <div
                                                class="border-2 border-gray-400 cursor-pointer border-dashed rounded-md p-4 text-center flex flex-col items-center justify-center">
                                                <div class="text-[18px] text-slate-300" id="image_icon">
                                                    <i class="fa-regular fa-image"></i>
                                                </div>
                                                <label for="image_main" class="text-[12px] text-gray-500 cursor-pointer">Thả
                                                    hình ảnh vào
                                                    đây, hoặc chọn <span class="text-[#003171] cursor-pointer">nhấp để
                                                        duyệt</span></label>
                                                <input type="file" class="hidden" id="image_main">
                                            </div>
                                            <div
                                                class="border-2 border-gray-400 cursor-pointer border-dashed rounded-md p-4 text-center flex flex-col items-center justify-center">
                                                <div class="text-[18px] text-slate-300" id="image_icon">
                                                    <i class="fa-regular fa-image"></i>
                                                </div>
                                                <label for="image_details_1" class="text-[12px] text-gray-500 cursor-pointer">Thả
                                                    hình ảnh vào
                                                    đây, hoặc chọn <span class="text-[#003171] cursor-pointer">nhấp để
                                                        duyệt</span></label>
                                                <input type="file" class="hidden" id="image_details_1">
                                            </div>
                                        </div>
                                        <div class="flex flex-col gap-2">
                                            <div
                                                class="border-2 border-gray-400 cursor-pointer border-dashed rounded-md p-4 text-center flex flex-col items-center justify-center">
                                                <div class="text-[18px] text-slate-300" id="image_icon">
                                                    <i class="fa-regular fa-image"></i>
                                                </div>
                                                <label for="image_details_2" class="text-[10px] text-gray-500 cursor-pointer">Thả
                                                    hình ảnh vào
                                                    đây,
                                                    hoặc chọn <span class="text-[#003171] cursor-pointer">nhấp để
                                                        duyệt</span></label>
                                                <input type="file" class="hidden" id="image_details_2">
                                            </div>
                                            <div
                                                class="border-2 border-gray-400 cursor-pointer border-dashed rounded-md p-4 text-center flex flex-col items-center justify-center">
                                                <div class="text-[18px] text-slate-300" id="image_icon">
                                                    <i class="fa-regular fa-image"></i>
                                                </div>
                                                <label for="image_details_3" class="text-[10px] text-gray-500 cursor-pointer">Thả
                                                    hình ảnh vào
                                                    đây,
                                                    hoặc chọn <span class="text-[#003171] cursor-pointer">nhấp để
                                                        duyệt</span></label>
                                                <input type="file" class="hidden" id="image_details_3">
                                            </div>
                                        </div>
                                    </div>
                                    <p class="text-gray-500 text-sm">Bạn cần thêm ít nhất 4 hình ảnh. Hãy chú ý đến chất
                                        lượng của các bức ảnh bạn thêm, tuân thủ các tiêu chuẩn về màu nền.</p>
                                </div>
                                <div class="flex justify-center lg:justify-end">
                                    <button type="submit"
                                        class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] transition-all duration-300 hover:bg-[#DC143C]">Chỉnh sửa sản
                                        phẩm</button>
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