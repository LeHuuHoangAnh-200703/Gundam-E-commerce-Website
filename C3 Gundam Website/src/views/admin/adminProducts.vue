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
                    <h1 class="font-bold text-[20px]">Danh sách sản phẩm</h1>
                    <div class="flex justify-center flex-1 gap-2 max-w-xl">
                        <input type="text"
                            class="items-center w-full p-3 bg-white border border-gray-400 text-[12px] font-semibold tracking-wider text-black rounded-md focus:outline-none"
                            placeholder="Tìm kiếm sản phẩm theo tên ..." />
                        <button
                            class="font-bold text-[12px] bg-[#DC143C] text-white px-4 py-2 rounded-md whitespace-nowrap">
                            Tìm kiếm
                        </button>
                    </div>
                </div>
                <div class="overflow-y-auto max-h-[calc(100vh-200px)] shadow-lg rounded-lg border-2 border-gray-300">
                    <table class="w-full bg-white whitespace-nowrap text-center text-gray-500">
                        <thead class="bg-[#1A1D27] text-white">
                            <tr>
                                <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã sản phẩm</th>
                                <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Ảnh sản phẩm</th>
                                <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tên sản phẩm</th>
                                <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Đơn giá</th>
                                <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Loại sản phẩm</th>
                                <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Còn lại</th>
                                <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mô tả</th>
                                <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Điều chỉnh</th>
                            </tr>
                        </thead>
                        <tbody class="w-full">
                            <tr class="border-t border-slate-500">
                                <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">SP3240</td>
                                <td>
                                    <img class="w-[100px] py-2 max-w-full ml-7" src="../../assets/img/MG01.jpg"
                                        alt="Hình ảnh sản phẩm" />
                                </td>
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                    <p class="overflow-hidden text-ellipsis whitespace-nowrap">RG 1/144 RX-0 UNICORN
                                        GUNDAM (BILIBILI 10TH ANNIVERSARY VER)</p>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                    1.230.000 VNĐ</td>
                                <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">RG
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">10
                                </td>
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                    <p class="overflow-hidden text-ellipsis text-[12px] whitespace-nowrap">RG 1/144 RX-0
                                        UNICORN
                                        GUNDAM (BILIBILI 10TH ANNIVERSARY VER) - Mô hình Gundam chính hãng Bandai sở hữu
                                        đôi cánh sắc sảo tạo thành từ DRAGOON System độc đáo. Đây là một trong những mẫu
                                        Gundam cực kỳ nổi tiếng với lượng fan đông đảo, và bạn sẽ không khỏi ấn tượng về
                                        độ ngầu, độ hoành tráng của nó.</p>
                                </td>
                                <td class="flex justify-center items-center gap-2 px-7 py-7 flex-col">
                                    <a href="`/admin/editProduct/`"
                                        class="inline-block bg-[#00697F] text-white font-medium py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#055565] whitespace-nowrap"><i
                                            class="fa-solid fa-pen-to-square"></i></a>
                                    <form>
                                        <button type="submit"
                                            class="inline-block text-white font-medium bg-[#DC143C] py-2 px-4 mb-4 rounded-md transition-all duration-300 hover:bg-[#B22222] whitespace-nowrap"><i
                                                class="fa-solid fa-trash"></i></button>
                                    </form>
                                </td>
                            </tr>
                        </tbody>
                        <tbody class="w-full">
                            <tr class="border-t border-slate-500">
                                <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">SP3240</td>
                                <td>
                                    <img class="w-[100px] py-2 max-w-full ml-7" src="../../assets/img/MG01.jpg"
                                        alt="Hình ảnh sản phẩm" />
                                </td>
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                    <p class="overflow-hidden text-ellipsis whitespace-nowrap">RG 1/144 RX-0 UNICORN
                                        GUNDAM (BILIBILI 10TH ANNIVERSARY VER)</p>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                    1.230.000 VNĐ</td>
                                <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">RG
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">10
                                </td>
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                    <p class="overflow-hidden text-ellipsis text-[12px] whitespace-nowrap">RG 1/144 RX-0
                                        UNICORN
                                        GUNDAM (BILIBILI 10TH ANNIVERSARY VER) - Mô hình Gundam chính hãng Bandai sở hữu
                                        đôi cánh sắc sảo tạo thành từ DRAGOON System độc đáo. Đây là một trong những mẫu
                                        Gundam cực kỳ nổi tiếng với lượng fan đông đảo, và bạn sẽ không khỏi ấn tượng về
                                        độ ngầu, độ hoành tráng của nó.</p>
                                </td>
                                <td class="flex justify-center items-center gap-2 px-7 py-7 flex-col">
                                    <a href="`/admin/editProduct/`"
                                        class="inline-block bg-[#00697F] text-white font-medium py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#055565] whitespace-nowrap"><i
                                            class="fa-solid fa-pen-to-square"></i></a>
                                    <form>
                                        <button type="submit"
                                            class="inline-block text-white font-medium bg-[#DC143C] py-2 px-4 mb-4 rounded-md transition-all duration-300 hover:bg-[#B22222] whitespace-nowrap"><i
                                                class="fa-solid fa-trash"></i></button>
                                    </form>
                                </td>
                            </tr>
                        </tbody>
                        
                    </table>
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