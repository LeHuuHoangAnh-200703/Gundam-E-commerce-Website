<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import NotificationClient from "@/components/Notification/NotificationClient.vue";
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);
const selectedProvince = ref({ id: '', name: '' });
const selectedDistrict = ref({ id: '', name: '' });
const selectedWard = ref({ id: '', name: '' });

const errors = ref({});
const formData = ref({
    name: '',
    idKhachHang: '',
    phone: '',
    address: ''
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

const fetchProvinces = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/location/provinces');
        provinces.value = response.data;
        console.log(response.data)
    } catch (error) {
        console.error("Error fetching provinces:", error);
    }
};

const fetchDistricts = async (provinceId) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/location/districts?province_id=${provinceId}`);
        districts.value = response.data;
        wards.value = [];
    } catch (error) {
        console.error("Error fetching districts:", error);
    }
};

const fetchWards = async (districtId) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/location/wards?district_id=${districtId}`);
        wards.value = response.data;
    } catch (error) {
        console.error("Error fetching wards:", error);
    }
};

const fetchCustomer = async (idKhachHang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/khachhang/${idKhachHang}`);
        formData.value.idKhachHang = response.data.MaKhachHang;
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

watch(() => selectedProvince.value.id, (newId) => {
    // Tìm tỉnh/thành phố tương ứng với id mới (newId)
    const province = provinces.value.find((p) => p.Id === newId);

    // Cập nhật tên tỉnh/thành phố nếu tìm thấy, nếu không gán giá trị rỗng
    selectedProvince.value.name = province ? province.Name : '';

    // Reset giá trị quận/huyện và xã/phường vì tỉnh/thành phố đã thay đổi
    selectedDistrict.value = { id: '', name: '' };
    selectedWard.value = { id: '', name: '' };
});

watch(() => selectedDistrict.value.id, (newId) => {
    // Tìm quận/huyện tương ứng với id mới (newId)
    const district = districts.value.find((d) => d.Id === newId);

    // Cập nhật tên quận/huyện nếu tìm thấy, nếu không gán giá trị rỗng
    selectedDistrict.value.name = district ? district.Name : '';

    // Reset giá trị xã/phường vì quận/huyện đã thay đổi
    selectedWard.value = { id: '', name: '' };
});

watch(() => selectedWard.value.id, (newId) => {
    // Tìm xã/phường tương ứng với id mới (newId)
    const ward = wards.value.find((w) => w.Id === newId);

    // Cập nhật tên xã/phường nếu tìm thấy, nếu không gán giá trị rỗng
    selectedWard.value.name = ward ? ward.Name : '';
});

const addInfoOrder = async () => {
    errors.value = {};
    const phoneRegex = /^0[1-9][0-9]{8}$|^0[1-9]{1}[0-9]{9}$|^(0[1-9]{1}[0-9]{1})( ?|-)?(\\(0[1-9]{1}[0-9]{1}\\))?( ?|-)?[0-9]{3} ?[0-9]{3}$/
    if (!formData.value.name) {
        errors.value.name = "Vui lòng nhập tên người nhận.";
    } else {
        formData.value.name = escapeHtml(formData.value.name);
    }

    if(!selectedProvince.value.name || !selectedDistrict.value.name || !selectedWard.value.name) {
        errors.value.address = "Vui lòng chọn đầy đủ tỉnh, huyện, và xã.";
    }

    if (!formData.value.phone) {
        errors.value.phone = "Vui lòng nhập số điện thoại.";
    } else if (!phoneRegex.test(formData.value.phone)) {
        errors.value.phone = "Số điện thoại không hợp lệ.";
    } else {
        formData.value.phone = escapeHtml(formData.value.phone);
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        const fullAddress = `${selectedWard.value.name}, ${selectedDistrict.value.name}, ${selectedProvince.value.name}`;
        const response = await axios.post(`http://localhost:3000/api/khachhang/thongtin/${formData.value.idKhachHang}`, {
            TenNguoiNhan: formData.value.name,
            DienThoai: formData.value.phone,
            DiaChi: fullAddress
        });
        showNotification("Thêm thông tin thành công!", "success");
        setTimeout(() => {
            router.push('/profile');
        }, 3000);
    } catch (error) {
        showNotification(error.response?.data?.message || "Thêm thông tin thất bại!", "error");
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

onMounted(() => {
    const idKhachHang = router.currentRoute.value.params.maKhachHang;
    console.log(idKhachHang);
    fetchCustomer(idKhachHang);
    fetchProvinces();
})
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative my-5 m-2 lg:mx-[200px] flex justify-center items-center flex-grow">
            <div class="w-full m-4">
                <div
                    class="bg-[#242424] overflow-hidden px-6 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div class="grid gap-8 lg:gap-5 text-sm text-white grid-cols-1 lg:grid-cols-3">
                        <div class="font-semibold">
                            <p class="text-lg">Cập nhật thông tin để đặt hàng</p>
                            <p>Vui lòng điền thông tin đầy đủ.</p>
                        </div>
                        <div class="lg:col-span-2">
                            <form @submit.prevent="addInfoOrder" method="POST"
                                class="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5"
                                enctype="multipart/form-data">
                                <div class="md:col-span-5 mb-2">
                                    <label for="full_name" class="font-semibold text-[16px]">Họ tên người nhận
                                        hàng</label>
                                    <input v-model="formData.name" type="text" name="name" id="full_name"
                                        placeholder="Nhập họ tên ..."
                                        class="h-10 border font-medium mt-1 rounded px-4 w-full bg-transparent"
                                        value="" />
                                    <p v-if="errors.name" class="text-red-500 text-sm my-2">{{ errors.name }}</p>
                                </div>
                                <div class="md:col-span-5 mb-2">
                                    <label for="province" class="font-semibold text-[16px]">Tỉnh/Thành</label>
                                    <select v-model="selectedProvince.id" @change="fetchDistricts(selectedProvince.id)"
                                        class="h-10 border mt-1 rounded px-4 w-full bg-transparent">
                                        <option value="" disabled>Chọn Tỉnh/Thành</option>
                                        <option class="text-black" v-for="province in provinces"
                                            :key="province.Id" :value="province.Id">
                                            {{ province.Name }}
                                        </option>
                                    </select>
                                    <p v-if="errors.address" class="text-red-500 text-sm my-2">{{ errors.address }}</p>
                                </div>
                                <div class="md:col-span-5 mb-2">
                                    <label for="district" class="font-semibold text-[16px]">Quận/Huyện</label>
                                    <select v-model="selectedDistrict.id" @change="fetchWards(selectedDistrict.id)"
                                        class="h-10 border mt-1 rounded px-4 w-full bg-transparent"
                                        :disabled="!selectedProvince.id">
                                        <option value="" disabled>Chọn Quận/Huyện</option>
                                        <option class="text-black" v-for="district in districts"
                                            :key="district.Id" :value="district.Id">
                                            {{ district.Name }}
                                        </option>
                                    </select>
                                    <p v-if="errors.address" class="text-red-500 text-sm my-2">{{ errors.address }}</p>
                                </div>
                                <div class="md:col-span-5 mb-2">
                                    <label for="ward" class="font-semibold text-[16px]">Phường/Xã</label>
                                    <select v-model="selectedWard.id"
                                        class="h-10 border mt-1 rounded px-4 w-full bg-transparent"
                                        :disabled="!selectedDistrict.id">
                                        <option value="" disabled>Chọn Phường/Xã</option>
                                        <option class="text-black" v-for="ward in wards" :key="ward.Id"
                                            :value="ward.Id">
                                            {{ ward.Name }}
                                        </option>
                                    </select>
                                    <p v-if="errors.address" class="text-red-500 text-sm my-2">{{ errors.address }}</p>
                                </div>
                                <div class="md:col-span-5 mb-2">
                                    <label for="phone" class="font-semibold text-[16px]">Điện thoại</label>
                                    <input type="text" v-model="formData.phone" placeholder="079-xxx-xxxx"
                                        class="h-10 border font-medium mt-1 rounded px-4 w-full bg-transparent" />
                                    <p v-if="errors.phone" class="text-red-500 text-sm mt-2">{{
                                        errors.phone }}</p>
                                </div>
                                <div class="md:col-span-5 text-right mt-2">
                                    <div class="inline-flex items-end">
                                        <button type="submit"
                                            class="bg-[#333f48] hover:bg-[#DC143C] text-white font-bold py-2 px-4 rounded">Cập
                                            nhật</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <NotificationClient :message="notification.message" :type="notification.type" />
        </div>
        <Footer />
        <BackToTop />
    </div>
</template>