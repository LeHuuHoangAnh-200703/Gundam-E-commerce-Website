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
                    <h1 class="font-bold text-[20px]">Cập nhật thông tin</h1>
                </div>
                <div class="relative flex flex-col gap-4 w-full overflow-auto max-h-[calc(100vh-150px)]">
                    <div class="flex-grow lg:px-24 p-4">
                        <div class="container max-w-screen-lg mx-auto">
                            <div>
                                <div class="bg-white rounded-lg shadow-lg p-4 px-4 md:p-8 mb-6">
                                    <div class="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3">
                                        <div class="text-[#333f48] font-semibold">
                                            <p class="text-lg">Cập nhật thông tin nhân viên</p>
                                            <p>Vui lòng điền thông tin đầy đủ.</p>
                                        </div>
                                        <div class="lg:col-span-2">
                                            <form action="" method="POST"
                                                class="grid gap-4 gap-y-3 text-sm grid-cols-1 md:grid-cols-5"
                                                enctype="multipart/form-data">

                                                <div class="md:col-span-5">
                                                    <label for="nameStaff" class="font-semibold text-[16px]">Họ
                                                        tên</label>
                                                    <input type="text" name="nameStaff" id="nameStaff"
                                                        v-model="nameStaff"
                                                        class="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                        placeholder="Nhập họ tên ..." />
                                                </div>

                                                <div class="md:col-span-5">
                                                    <label for="dateStaff" class="font-semibold text-[16px]">Ngày
                                                        sinh</label>
                                                    <input type="date" name="dateStaff" id="dateStaff"
                                                        v-model="dateStaff"
                                                        class="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                        placeholder="Nhập ngày sinh ..." />
                                                </div>

                                                <div class="md:col-span-5">
                                                    <label for="phoneStaff" class="font-semibold text-[16px]">Số điện
                                                        thoại</label>
                                                    <input type="text" readonly name="phoneStaff" id="phoneStaff"
                                                        v-model="phoneStaff"
                                                        class="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                        placeholder="Nhập số điện thoại ...">
                                                </div>

                                                <div class="md:col-span-5">
                                                    <label for="position" class="font-semibold text-[16px]">Chức
                                                        vụ</label>
                                                    <select id="position"
                                                        class="h-10 border mt-1 cursor-pointer rounded px-4 w-full bg-gray-50">
                                                        <option value="Quản trị viên">Quản trị viên</option>
                                                        <option value="Nhân viên">Nhân viên</option>
                                                    </select>
                                                </div>
                                                <div class="md:col-span-5">
                                                    <label for="password" class="font-semibold text-[16px]">Mật
                                                        khẩu</label>
                                                    <input type="password" name="password" id="password"
                                                        v-model="password"
                                                        class="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                        placeholder="Nhập mật khẩu ...">
                                                </div>

                                                <div class="md:col-span-5">
                                                    <label for="confirmPassword" class="font-semibold text-[16px]">Nhập
                                                        lại mật khẩu</label>
                                                    <input type="password" name="confirmPassword" id="confirmPassword"
                                                        v-model="confirmPassword"
                                                        class="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                        placeholder="Xác nhận mật khẩu ...">
                                                </div>
                                                <div class="md:col-span-5 text-right">
                                                    <div class="inline-flex items-end">
                                                        <button type="submit"
                                                            class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] transition-all duration-300 hover:bg-[#003171]">Cập nhật thông tin</button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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