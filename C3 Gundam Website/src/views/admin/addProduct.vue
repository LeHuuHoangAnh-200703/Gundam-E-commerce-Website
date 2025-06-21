<script setup>
import { ref, onMounted, computed } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import NotificationAdmin from "@/components/Notification/NotificationAdmin.vue";
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
// Hàm mã hóa đầu vào
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const TenAdmin = localStorage.getItem("TenAdmin");
const ThoiGian = new Date();

const listSuppliers = ref([]);
const listProductType = ref([]);
const errors = ref({});
const formData = ref({
    nameProduct: '',
    price: '',
    typeProduct: '',
    supplier: '',
    description: '',
    youtubeLink: '',
    productFeatures: '',
    images: [],
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

const fetchSuppliers = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/nhacungcap');
        listSuppliers.value = response.data.map(supplier => {
            return {
                ...supplier
            };
        });
    } catch (error) {
        console.error('Error fetching:', error);
    }
};

const fetchProductType = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/loaisanpham');
        listProductType.value = response.data.map(productType => {
            return {
                ...productType
            };
        });
    } catch (error) {
        console.error('Error fetching:', error);
    }
}

const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    formData.value.images = [...formData.value.images, ...files];
    event.target.value = '';
};

const addProduct = async () => {
    errors.value = {};

    if (!formData.value.nameProduct) {
        errors.value.nameProduct = "Tên sản phẩm không được để trống.";
    } else {
        formData.value.nameProduct = escapeHtml(formData.value.nameProduct);
    }

    if (!formData.value.price) {
        errors.value.price = "Giá bán không được để trống.";
    } else if (formData.value.price < 0) {
        errors.value.price = "Giá bán không được âm.";
    }

    if (!formData.value.typeProduct) {
        errors.value.typeProduct = "Loại sản phẩm không được để trống.";
    }

    if (!formData.value.supplier) {
        errors.value.supplier = "Nhà cung cấp không được để trống.";
    }

    if (!formData.value.description) {
        errors.value.description = "Mô tả không được để trống.";
    } else {
        formData.value.description = escapeHtml(formData.value.description);
    }

    if (!formData.value.youtubeLink) {
        errors.value.youtubeLink = "Link youtube không được để trống.";
    } else {
        formData.value.youtubeLink = escapeHtml(formData.value.youtubeLink);
    }

    if (!formData.value.productFeatures) {
        errors.value.productFeatures = "Tính năng không được để trống.";
    } else {
        formData.value.productFeatures = escapeHtml(formData.value.productFeatures);
    }

    if (formData.value.images.length < 4) {
        errors.value.images = "Bạn cần thêm ít nhất 4 hình ảnh.";
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        const dataToSend = new FormData();
        dataToSend.append('TenSanPham', formData.value.nameProduct);
        dataToSend.append('GiaBan', formData.value.price);
        dataToSend.append('MaLoaiSanPham', formData.value.typeProduct);
        dataToSend.append('MaNhaCungCap', formData.value.supplier);
        dataToSend.append('MoTa', formData.value.description);
        dataToSend.append('YoutubeUrl', formData.value.youtubeLink);
        dataToSend.append('TinhNang', formData.value.productFeatures);

        formData.value.images.forEach(image => {
            dataToSend.append('Images', image);
        });
        console.log(dataToSend)
        const response = await axios.post('http://localhost:3000/api/sanpham', dataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        const notificationData = {
            ThongBao: `Vừa thêm sản phẩm ${formData.value.nameProduct}`,
            NguoiChinhSua: TenAdmin,
            ThoiGian: ThoiGian,
        };

        await axios.post('http://localhost:3000/api/thongbao', notificationData);

        showNotification("Thêm sản phẩm thành công!", "success");
        setTimeout(() => {
            router.push('/admin/adminProducts');
        }, 3000);
    } catch (err) {
        showNotification(err.response?.data?.message || "Thêm sản phẩm thất bại!", "success");
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

const imageUrls = computed(() => {
    return formData.value.images.map(image => URL.createObjectURL(image));
});

const removeImage = (index) => {
    formData.value.images.splice(index, 1);
};

onMounted(() => {
    fetchSuppliers();
    fetchProductType();
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
                    <div class="flex lg:flex-row flex-col gap-4 justify-center lg:justify-between items-center">
                        <h1 class="font-bold text-[20px] uppercase">Thêm sản phẩm</h1>
                    </div>
                    <div class="bg-white rounded-lg shadow-lg w-full p-4">
                        <form @submit.prevent="addProduct" method="POST">
                            <div class="w-full flex flex-col lg:flex-row gap-8">
                                <div class="lg:w-1/2 w-full flex flex-col gap-4">
                                    <div class="flex flex-col gap-2">
                                        <label for="nameProduct" class="text-[15px] font-semibold">Tên sản phẩm</label>
                                        <input type="text" v-model="formData.nameProduct" id="nameProduct"
                                            class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="Nhập tên sản phẩm ...">
                                        <p v-if="errors.nameProduct" class="text-red-500 text-sm mt-2">{{
                                            errors.nameProduct }}</p>
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label for="price" class="text-[15px] font-semibold">Giá bán sản
                                            phẩm</label>
                                        <input type="number" v-model="formData.price" id="price"
                                            class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="Nhập giá bán sản phẩm ...">
                                        <p v-if="errors.price" class="text-red-500 text-sm mt-2">{{
                                            errors.price }}</p>
                                    </div>
                                    <div class="flex gap-4">
                                        <div class="flex flex-col gap-2 w-full">
                                            <label for="typeProduct" class="text-[15px] font-semibold">Loại sản
                                                phẩm</label>
                                            <select v-model="formData.typeProduct"
                                                class="p-2 border-2 cursor-pointer text-[#003171] rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                                name="" id="typeProduct">
                                                <option value="" class="text-[#003171] font-semibold">Chọn loại sản phẩm
                                                    phù hợp</option>
                                                <option :value="productType.MaLoaiSanPham"
                                                    v-for="(productType, index) in listProductType" :key="index"
                                                    class="text-[#003171] font-semibold">{{ productType.TenLoaiSanPham
                                                    }}</option>
                                            </select>
                                            <p v-if="errors.typeProduct" class="text-red-500 text-sm mt-2">{{
                                                errors.typeProduct }}</p>
                                        </div>
                                        <div class="flex flex-col gap-2 w-full">
                                            <label for="brandProduct" class="text-[15px] font-semibold">Nhà cung
                                                cấp</label>
                                            <select v-model="formData.supplier"
                                                class="p-2 border-2 cursor-pointer text-[#003171] rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                                name="" id="brandProduct">
                                                <option value="" class="text-[#003171] font-semibold">Chọn nhà cung cấp
                                                    phù hợp</option>
                                                <option v-for="(supplier, index) in listSuppliers" :key="index"
                                                    :value="supplier.MaNhaCungCap" class="text-[#003171] font-semibold">
                                                    {{ supplier.MaNhaCungCap }} -
                                                    {{ supplier.TenNhaCungCap }}</option>
                                            </select>
                                            <p v-if="errors.supplier" class="text-red-500 text-sm mt-2">{{
                                                errors.supplier }}</p>
                                        </div>
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label for="description" class="text-[15px] font-semibold">Mô tả sản phẩm <i
                                                class="fa-solid fa-circle-info text-gray-300"></i></label>
                                        <textarea type="text" v-model="formData.description" id="description"
                                            class="p-2 border-2 rounded-md text-[14px] h-32 outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="Mô tả sản phẩm ..."></textarea>
                                        <p v-if="errors.description" class="text-red-500 text-sm mt-2">{{
                                            errors.description }}</p>
                                    </div>
                                </div>
                                <div class="lg:w-1/2 w-full flex flex-col gap-4">
                                    <div class="flex flex-col gap-2">
                                        <label for="youtubeLink" class="text-[15px] font-semibold">Link sản phẩm</label>
                                        <input type="text" v-model="formData.youtubeLink" id="youtubeLink"
                                            class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="Nhập link sản phẩm ...">
                                        <p v-if="errors.youtubeLink" class="text-red-500 text-sm mt-2">{{
                                            errors.youtubeLink }}</p>
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label for="productFeatures" class="text-[15px] font-semibold">Tính năng sản
                                            phẩm <i class="fa-solid fa-circle-info text-gray-300"></i></label>
                                        <textarea type="text" v-model="formData.productFeatures" id="productFeatures"
                                            class="p-2 border-2 rounded-md text-[14px] h-32 outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="Mô tả sản phẩm ..."></textarea>
                                        <p v-if="errors.productFeatures" class="text-red-500 text-sm mt-2">{{
                                            errors.productFeatures }}</p>
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label for="image_upload" class="text-[15px] font-semibold">Hình ảnh sản phẩm <i
                                                class="fa-solid fa-circle-info text-gray-300"></i></label>
                                        <label for="image_upload"
                                            class="border-2 border-gray-400 cursor-pointer border-dashed rounded-md p-4 text-center flex flex-col items-center justify-center">
                                            <div class="text-[18px] text-slate-300" id="image_icon">
                                                <i class="fa-regular fa-image"></i>
                                            </div>
                                            <label for="image_upload" class="text-[12px] text-gray-500 cursor-pointer">
                                                Thả hình ảnh vào đây, hoặc chọn <span
                                                    class="text-[#003171] cursor-pointer">nhấp để duyệt</span>
                                            </label>
                                            <input type="file" class="hidden" id="image_upload" multiple
                                                @change="handleFileUpload">
                                            <div class="flex flex-wrap gap-2 mt-2">
                                                <div v-for="(imageUrl, index) in imageUrls" :key="index"
                                                    class="relative">
                                                    <img :src="imageUrl"
                                                        class="w-24 h-24 object-cover border rounded-md" />
                                                    <button type="button"
                                                        class="absolute -top-2 -right-2 bg-[#DB3F4C] rounded-full w-5 h-5 flex items-center justify-center text-black"
                                                        @click="removeImage(index)">
                                                        <i class="fa-solid fa-xmark text-white"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </label>
                                        <p v-if="errors.images" class="text-red-500 text-sm mt-2">{{ errors.images }}
                                        </p>
                                        <p class="text-gray-500 text-sm">Bạn cần thêm ít nhất 1 hình ảnh. Hãy chú ý đến
                                            chất lượng của các bức ảnh bạn thêm, tuân thủ các tiêu chuẩn về màu nền.</p>
                                    </div>
                                    <div class="flex justify-center lg:justify-end">
                                        <button type="submit"
                                            class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] transition-all duration-300 hover:bg-[#003171]">Thêm
                                            sản
                                            phẩm</button>
                                    </div>
                                </div>
                            </div>
                        </form>
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