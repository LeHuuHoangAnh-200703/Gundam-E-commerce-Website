<script setup>
import router from "@/router";
import axios from "axios";
import { ref, onMounted, onUnmounted } from "vue";
import { io } from "socket.io-client";

const isSidebarVisible = ref(false);
const isNotificationVisible = ref(false);
const hasUnreadNotifications = ref(false);
const hasUnreadMessages = ref(false); // Biến để theo dõi tin nhắn chưa đọc
const TenAdmin = localStorage.getItem("TenAdmin");

const listNatifications = ref([]);

// Kết nối Socket.IO
const socket = io("http://localhost:3000", {
  auth: {
    userId: localStorage.getItem("MaAdmin"),
    userName: TenAdmin,
  },
});

const sidebarMenuMobile = [
  { name: "Tổng quan", icon: "fa-solid fa-chart-simple", path: "statisticals" },
  { name: "Quản lý sản phẩm", icon: "fa-solid fa-igloo", path: "adminProducts" },
  { name: "Quản lý đơn hàng", icon: "fa-solid fa-bag-shopping", path: "listOrders" },
  { name: "Quản lý đánh giá", icon: "fa-solid fa-comments", path: "listFeedBacks" },
  { name: "Quản lý khách hàng", icon: "fa-solid fa-users", path: "customers" },
  { name: "Quản lý nhà cung cấp", icon: "fa-solid fa-user-large", path: "listSuppliers" },
  { name: "Quản lý loại sản phẩm", icon: "fa-solid fa-table", path: "listProductType" },
  { name: "Quản lý mã giảm giá", icon: "fa-solid fa-tags", path: "discountCode" },
  { name: "Quản lý bài đăng", icon: "fa-solid fa-hashtag", path: "communityPostManage" },
  { name: "Thêm sản phẩm", icon: "fa-solid fa-cart-plus", path: "addProduct" },
  { name: "Quản lý kho", icon: "fa-solid fa-rectangle-list", path: "inventoryLits" },
  { name: "Đăng xuất", icon: "fa-solid fa-right-from-bracket", path: "adminLogin" },
];

const logout = async () => {
  const maAdmin = localStorage.getItem("MaAdmin");
  try {
    const response = await axios.post("http://localhost:3000/api/admin/logout", { maAdmin });
    localStorage.removeItem("TenAdmin");
    localStorage.removeItem("EmailAdmin");
    localStorage.removeItem("MaAdmin");
    router.push("/admin/adminLogin");
  } catch (error) {
    console.error("Đăng xuất thất bại:", error.response.data.message);
  }
};

const toggleSideBar = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
};

const toggleNotification = () => {
  isNotificationVisible.value = !isNotificationVisible.value;
  if (isNotificationVisible.value) {
    hasUnreadNotifications.value = false;
  }
};

const fetchNatifications = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/thongbao");
    listNatifications.value = response.data.map((natification) => {
      return {
        ...natification,
        ThoiGian: new Date(natification.ThoiGian),
      };
    });
    listNatifications.value.sort((a, b) => b.ThoiGian - a.ThoiGian);
    if (listNatifications.value.length > 0) {
      hasUnreadNotifications.value = true;
    }
  } catch (err) {
    console.log("error fetching: ", err);
  }
};

const formatDate = (date) => {
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  };
  const formattedDate = date.toLocaleString("vi-VN", options);
  const [time, day] = formattedDate.split(", ");
  return `${time}`;
};

onMounted(async () => {
  await fetchNatifications();

  socket.on("connect", () => {
    console.log("Đã kết nối Socket.IO với server trong Navbar"); // Debug kết nối
  });

  // Lắng nghe tin nhắn mới từ khách hàng
  socket.on("receiveMessage", (msg) => {
    console.log("Nhận tin nhắn mới trong Navbar:", msg); // Debug
    if (msg.senderId !== socket.auth.userId) { // Chỉ hiển thị dấu chấm nếu không phải từ admin
      hasUnreadMessages.value = true;
    }
  });

  // Khi admin nhấp vào biểu tượng chat, đánh dấu đã đọc và xóa dấu chấm đỏ
  socket.on("chatRoomsUpdated", (updatedChatRooms) => {
    const adminRooms = updatedChatRooms.filter((room) => room.receiverId === socket.auth.userId);
    const hasUnread = adminRooms.some((room) => room.receiverMessagesNotRead.length > 0);
    hasUnreadMessages.value = hasUnread;
    console.log("Cập nhật trạng thái tin nhắn chưa đọc:", hasUnreadMessages.value); // Debug
  });
});

onUnmounted(() => {
  socket.disconnect();
});
</script>

<template>
  <div class="w-full">
    <nav class="bg-white flex p-3 justify-between shadow-md rounded-md">
      <div class="flex gap-3">
        <img src="../../assets/img/avatar.jpg" class="w-[50px] rounded-full" alt="" />
        <div class="font-semibold flex flex-col justify-center">
          <p class="text-[14px]">{{ TenAdmin }}</p>
          <p class="text-[12px] hidden lg:block">
            Chào mừng quản trị viên <span class="text-[#DB3F4C]">{{ TenAdmin }}</span> quay trở lại!
          </p>
        </div>
      </div>
      <div class="flex gap-3 justify-center items-center">
        <router-link to="" @click="toggleNotification" class="px-2 py-2 rounded-full group">
          <i class="fa-solid fa-bell relative transition-all duration-200 text-[20px]">
            <span
              v-if="hasUnreadNotifications"
              class="absolute top-0 right-0 w-[10px] h-[10px] bg-[#DB3F4C] border-2 border-white transition-all duration-200 rounded-full"
            ></span>
          </i>
        </router-link>
        <router-link to="/admin/chatWithCustomer" class="px-2 py-2 rounded-full group">
          <i class="fa-solid fa-comments relative transition-all duration-200 text-[20px]">
            <span
              v-if="hasUnreadMessages"
              class="absolute top-0 right-0 w-[10px] h-[10px] bg-[#DB3F4C] border-2 border-white transition-all duration-200 rounded-full"
            ></span>
          </i>
        </router-link>
        <button @click.prevent="logout" class="px-2 py-2 rounded-full group hidden lg:block">
          <i
            class="fa-solid fa-right-from-bracket group-hover:text-[#DB3F4C] transition-all duration-200 text-[20px]"
          ></i>
        </button>
        <button @click="toggleSideBar" class="block lg:hidden">
          <i class="fa-solid fa-bars text-[20px]"></i>
        </button>
      </div>
      <div
        class="fixed bottom-0 top-0 left-0 bg-[#1A1D27] w-[100%] min-h-full transition-transform duration-300 z-20"
        :class="{ 'translate-x-full': !isSidebarVisible, 'translate-x-0': isSidebarVisible }"
      >
        <div class="flex flex-col gap-4 px-5 py-5">
          <div class="flex justify-between items-center">
            <p class="font-bold text-white text-center text-[20px] font-bungee">
              <span class="text-[#DB3F4C]">C3 </span> Gundam Store
            </p>
            <i
              @click="toggleSideBar"
              class="fa-regular fa-circle-xmark cursor-pointer text-white text-4xl"
            ></i>
          </div>
          <hr />
          <ul class="flex flex-col text-white">
            <router-link
              :to="sidebar.path"
              v-for="(sidebar, index) in sidebarMenuMobile"
              :key="index"
              class="flex gap-3 items-center font-semibold cursor-pointer py-3 hover:text-[#DB3F4C] rounded-md transition-all duration-200"
            >
              <i :class="sidebar.icon"></i>
              {{ sidebar.name }}
            </router-link>
          </ul>
        </div>
      </div>
      <div
        class="notification fixed top-28 w-full lg:w-auto bg-white max-h-[calc(100vh-150px)] overflow-hidden shadow-lg p-4 rounded-lg z-10"
        :class="{ 'lg:right-[30%] right-[100%]': isNotificationVisible, 'right-[-100%]': !isNotificationVisible }"
      >
        <div class="flex justify-between items-center">
          <p class="font-semibold text-[18px]">Thông báo</p>
          <i
            @click="toggleNotification"
            class="fa-solid cursor-pointer fa-arrow-right font-semibold text-[20px]"
          ></i>
        </div>
        <hr class="mt-2" />
        <div class="flex flex-col max-h-[450px] overflow-y-auto">
          <div
            class="flex gap-3 items-center border-b py-2"
            v-for="(natification, index) in listNatifications"
            :key="index"
          >
            <div class="w-12 h-12 rounded-full bg-[#40E0D0] flex justify-center items-center">
              <i class="fa-regular fa-bell text-[20px]"></i>
            </div>
            <div class="flex flex-col">
              <div class="text-ellipsis whitespace-nowrap overflow-hidden max-w-[360px]">
                <a class="font-semibold text-[16px]">{{ natification.ThongBao }}</a>
              </div>
              <p class="font-semibold text-[12px]">
                Người chỉnh sửa: <span class="text-[#DB3F4C]">{{ natification.NguoiChinhSua }}</span>
              </p>
              <p class="text-[12px] font-medium text-gray-600">{{ formatDate(natification.ThoiGian) }}</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.fixed {
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
}

.fixed.translate-x-0 {
  transform: translateX(0);
}

.notification {
  transition: right 0.3s ease-in-out;
}
</style>