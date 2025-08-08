<script setup>
import { ref, onMounted, computed } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import ConfirmDialog from "@/components/Notification/ConfirmDialog.vue";
import NotificationAdmin from "@/components/Notification/NotificationAdmin.vue";
import axios from 'axios';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts;

const listCustomers = ref([]);
const searchValue = ref('');
const showReasonDialog = ref(false);
const selectedReason = ref('');
const currentCustomer = ref(null);
const notification = ref({
    message: '',
    type: ''
});
const listReasons = ref([
    { value: 'cancel_orders', title: 'Hủy đơn hàng liên tục' },
    { value: 'fake_info', title: 'Đăng bài với thông tin không phù hợp nhiều lần' },
    { value: 'payment_fraud', title: 'Đánh giá với từ ngữ thiếu văn minh' },
    { value: 'abuse_system', title: 'Ý kiến từ khách hàng' }
]);

const showNotification = (msg, type) => {
    notification.value = { message: msg, type: type };
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
};

// Dialog state với props
const dialogState = ref({
    visible: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy bỏ',
    onConfirm: null,
    onCancel: null
});

const showConfirmDialog = (config) => {
    dialogState.value = {
        visible: true,
        title: config.title || 'Xác nhận',
        message: config.message || 'Bạn có chắc chắn muốn thực hiện hành động này?',
        type: config.type || 'warning',
        confirmText: config.confirmText || 'Xác nhận',
        cancelText: config.cancelText || 'Hủy bỏ',
        onConfirm: config.onConfirm,
        onCancel: config.onCancel
    };
};

const handleDialogConfirm = () => {
    if (dialogState.value.onConfirm) {
        dialogState.value.onConfirm();
    }
    dialogState.value.visible = false;
};

const handleDialogCancel = () => {
    if (dialogState.value.onCancel) {
        dialogState.value.onCancel();
    }
    dialogState.value.visible = false;
};

const handleDialogClose = () => {
    dialogState.value.visible = false;
};
const fetchCustomers = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/khachhang');
        listCustomers.value = response.data.map(customer => {
            return {
                ...customer,
                NgayTao: new Date(customer.NgayTao)
            }
        }).sort((a, b) => b.TongDonHang - a.TongDonHang);
    } catch (err) {
        console.log("Error fetching: ", err.message);
    }
}

const toggleAccount = async (newStatus, maKhachHang, email, customer) => {
    const nextStatus = newStatus === 'Đang sử dụng' ? 'Vô hiệu hóa' : 'Đang sử dụng';

    if (nextStatus === 'Vô hiệu hóa') {
        currentCustomer.value = {
            ...customer,
            maKhachHang,
            email,
            currentStatus: newStatus
        };
        selectedReason.value = '';
        showReasonDialog.value = true;
    } else {
        showConfirmDialog({
            title: 'Kích hoạt tài khoản',
            message: `Bạn có chắc chắn muốn kích hoạt tài khoản "${customer.TenKhachHang}" không?`,
            type: 'success',
            confirmText: 'Kích hoạt',
            cancelText: 'Hủy bỏ',
            onConfirm: async () => {
                await performAccountUpdate(newStatus, maKhachHang, email, customer.TenKhachHang, null);
            }
        });
    }
};

const handleReasonSubmit = async () => {
    if (!selectedReason.value) {
        return;
    }

    const reasonText = listReasons.value.find(r => r.value === selectedReason.value)?.title || selectedReason.value;
    showReasonDialog.value = false;

    await performAccountUpdate(
        currentCustomer.value.currentStatus,
        currentCustomer.value.maKhachHang,
        currentCustomer.value.email,
        currentCustomer.value.TenKhachHang,
        reasonText
    );
};

const performAccountUpdate = async (currentStatus, maKhachHang, email, tenKhachHang, lyDoKhoa) => {
    const nextStatus = currentStatus === 'Đang sử dụng' ? 'Vô hiệu hóa' : 'Đang sử dụng';

    try {
        const requestData = { TrangThai: nextStatus };
        if (lyDoKhoa) {
            requestData.LyDoKhoa = lyDoKhoa;
        }

        const response = await axios.patch(
            `http://localhost:3000/api/khachhang/tinhtrangtaikhoan/${maKhachHang}`,
            requestData
        );

        if (currentStatus === 'Đang sử dụng' && nextStatus === 'Vô hiệu hóa') {
            try {
                await axios.post(`http://localhost:3000/api/khachhang/guimail?email=${email}`, {
                    customerName: tenKhachHang,
                    reason: lyDoKhoa
                });
            } catch (emailError) {
                console.error('Lỗi khi gửi email:', emailError);
            }
        }

        const TenAdmin = localStorage.getItem("TenAdmin");
        const notificationData = {
            ThongBao: `Vừa cập nhật trạng thái ${tenKhachHang} từ ${currentStatus} sang ${nextStatus}${lyDoKhoa ? ` - Lý do: ${lyDoKhoa}` : ''}`,
            NguoiChinhSua: TenAdmin,
            ThoiGian: new Date(),
        };

        await axios.post('http://localhost:3000/api/thongbao', notificationData);
        await fetchCustomers();

        const message = nextStatus === 'Vô hiệu hóa'
            ? `Đã khóa tài khoản "${tenKhachHang}" thành công!`
            : `Đã kích hoạt tài khoản "${tenKhachHang}" thành công!`;
        showNotification(message, "success");

    } catch (error) {
        console.error('Error updating account status:', error);
        showNotification("Lỗi khi cập nhật trạng thái tài khoản!", "error");
    }
};

const closeReasonDialog = () => {
    showReasonDialog.value = false;
    selectedReason.value = '';
    currentCustomer.value = null;
};

const findNameCustomers = computed(() => {
    if (!searchValue.value) {
        return listCustomers.value;
    }
    return listCustomers.value.filter(customer => {
        return customer.TenKhachHang.toLowerCase().includes(searchValue.value.toLowerCase());
    })
});

// Lấy top 3 khách hàng mua nhiều nhất
const top3Customers = computed(() => {
    return listCustomers.value.slice(0, 3);
});

// Hàm xuất PDF top 3 khách hàng với pdfMake
const exportTop3CustomersPDF = () => {
    showConfirmDialog({
        title: 'Thông báo xác nhận',
        message: 'Bạn có muốn xuất báo cáo TOP 3 khách hàng mua nhiều nhất không?',
        type: 'info',
        confirmText: 'Xuất báo cáo',
        cancelText: 'Hủy bỏ',
        onConfirm: () => {
            try {
                // Tạo nội dung khách hàng dạng card layout
                const customerContent = top3Customers.value.map((customer, index) => {
                    const rank = index + 1;
                    const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Vàng, Bạc, Đồng
                    const rankColor = rankColors[index] || '#E0E0E0';

                    return [
                        // Card container cho mỗi khách hàng
                        {
                            stack: [
                                // Header với hạng và tên khách hàng
                                {
                                    columns: [
                                        {
                                            width: 80,
                                            stack: [
                                                {
                                                    text: `#${rank}`,
                                                    style: 'rankNumber',
                                                    background: rankColor,
                                                    color: '#000',
                                                    alignment: 'center',
                                                    margin: [0, 8, 0, 2]
                                                }
                                            ]
                                        },
                                        {
                                            width: '*',
                                            stack: [
                                                {
                                                    text: customer.TenKhachHang,
                                                    style: 'customerName',
                                                    margin: [15, 5, 0, 2]
                                                },
                                                {
                                                    text: `Mã KH: ${customer.MaKhachHang}`,
                                                    style: 'customerCode',
                                                    margin: [15, 0, 0, 5]
                                                }
                                            ]
                                        },
                                        {
                                            width: 120,
                                            stack: [
                                                {
                                                    text: 'TỔNG ĐƠN HÀNG',
                                                    style: 'orderCountLabel',
                                                    alignment: 'center'
                                                },
                                                {
                                                    text: customer.TongDonHang.toString(),
                                                    style: 'orderCountNumber',
                                                    alignment: 'center'
                                                },
                                                {
                                                    text: 'đơn hàng',
                                                    style: 'orderCountUnit',
                                                    alignment: 'center'
                                                }
                                            ]
                                        }
                                    ],
                                    margin: [0, 0, 0, 10]
                                },

                                // Thông tin chi tiết khách hàng
                                {
                                    columns: [
                                        {
                                            width: '50%',
                                            stack: [
                                                {
                                                    columns: [
                                                        { text: 'Email:', style: 'labelWithIcon', width: 60 },
                                                        {
                                                            text: customer.Email,
                                                            style: 'infoText',
                                                            width: '*'
                                                        }
                                                    ],
                                                    margin: [20, 3, 0, 3]
                                                },
                                                {
                                                    columns: [
                                                        { text: 'Tham gia:', style: 'labelWithIcon', width: 60 },
                                                        {
                                                            text: formatDate(customer.NgayTao),
                                                            style: 'dateText',
                                                            width: '*'
                                                        }
                                                    ],
                                                    margin: [20, 3, 0, 3]
                                                }
                                            ]
                                        },
                                        {
                                            width: '50%',
                                            stack: [
                                                {
                                                    columns: [
                                                        { text: 'Loại KH:', style: 'labelWithIcon', width: 60 },
                                                        {
                                                            text: customer.TongDonHang >= 10 ? 'VIP' :
                                                                customer.TongDonHang >= 5 ? 'Thân thiết' : 'Thường',
                                                            style: customer.TongDonHang >= 10 ? 'vipText' :
                                                                customer.TongDonHang >= 5 ? 'loyalText' : 'normalText',
                                                            width: '*'
                                                        }
                                                    ],
                                                    margin: [20, 3, 0, 3]
                                                },
                                                {
                                                    columns: [
                                                        { text: 'Hạng:', style: 'labelWithIcon', width: 60 },
                                                        {
                                                            text: `${rank}/${top3Customers.value.length}`,
                                                            style: 'rankText',
                                                            width: '*'
                                                        }
                                                    ],
                                                    margin: [20, 3, 0, 3]
                                                }
                                            ]
                                        }
                                    ],
                                    margin: [0, 5, 0, 15]
                                }
                            ],
                            // Background và border cho card
                            background: rank <= 3 ? '#FAFAFA' : '#F8F8F8',
                            margin: [0, 5, 0, 5]
                        },

                        // Đường phân cách
                        {
                            canvas: [
                                {
                                    type: 'line',
                                    x1: 0, y1: 0,
                                    x2: 515, y2: 0,
                                    lineWidth: rank <= 3 ? 2 : 1,
                                    lineColor: rank <= 3 ? rankColor : '#E0E0E0'
                                }
                            ],
                            margin: [0, 10, 0, 20]
                        }
                    ];
                }).flat();

                // Tính toán thống kê
                const totalOrders = top3Customers.value.reduce((sum, c) => sum + c.TongDonHang, 0);
                const avgOrders = Math.round(totalOrders / top3Customers.value.length * 10) / 10;

                const docDefinition = {
                    pageSize: 'A4',
                    pageMargins: [40, 60, 40, 60],
                    content: [
                        // Header
                        {
                            stack: [
                                { text: 'QUẢN LÝ KHÁCH HÀNG', style: 'header' },
                                { text: 'Hệ thống bán hàng C3 GUNDAM STORE', style: 'subheader' },
                                { text: 'Địa chỉ: Đường 96 - Tân Phú - TX.Long Mỹ - Hậu Giang', style: 'subheader' },
                                {
                                    canvas: [
                                        {
                                            type: 'line',
                                            x1: 0, y1: 0,
                                            x2: 515, y2: 0,
                                            lineWidth: 2,
                                            lineColor: '#333'
                                        }
                                    ],
                                    margin: [0, 10, 0, 10]
                                }
                            ],
                            margin: [0, 0, 0, 20]
                        },

                        // Title
                        {
                            text: 'BÁO CÁO TOP 3 KHÁCH HÀNG MUA NHIỀU NHẤT',
                            style: 'title',
                            margin: [0, 0, 0, 5]
                        },
                        {
                            text: `Ngày xuất: ${formatDate(new Date())}`,
                            style: 'dateInfo',
                            margin: [0, 0, 0, 20]
                        },

                        // Thống kê tổng quan
                        {
                            columns: [
                                {
                                    width: '33.3%',
                                    stack: [
                                        { text: 'TỔNG KHÁCH HÀNG', style: 'statLabel' },
                                        { text: listCustomers.value.length.toString(), style: 'statNumber' }
                                    ],
                                    alignment: 'center'
                                },
                                {
                                    width: '33.3%',
                                    stack: [
                                        { text: 'TOP 3 TỔNG ĐƠN', style: 'statLabel' },
                                        { text: totalOrders.toString(), style: 'statNumber', color: '#e74c3c' }
                                    ],
                                    alignment: 'center'
                                },
                                {
                                    width: '33.3%',
                                    stack: [
                                        { text: 'KHÁCH VIP', style: 'statLabel' },
                                        {
                                            text: top3Customers.value.filter(c => c.TongDonHang >= 10).length.toString(),
                                            style: 'statNumber',
                                            color: '#f39c12'
                                        }
                                    ],
                                    alignment: 'center'
                                }
                            ],
                            margin: [0, 0, 0, 25]
                        },

                        // Tiêu đề danh sách
                        {
                            text: 'BẢNG XẾP HẠNG KHÁCH HÀNG XUẤT SẮC',
                            style: 'sectionHeader',
                            margin: [0, 0, 0, 15]
                        },

                        // Nội dung khách hàng
                        ...customerContent,

                        // Phân tích và nhận xét
                        {
                            stack: [
                                {
                                    text: 'PHÂN TÍCH & NHẬN XÉT',
                                    style: 'analysisHeader',
                                    margin: [0, 20, 0, 10]
                                },
                                {
                                    ul: [
                                        `Khách hàng số 1: ${top3Customers.value[0]?.TenKhachHang} với ${top3Customers.value[0]?.TongDonHang} đơn hàng`,
                                        `Tổng đơn hàng của TOP 3: ${totalOrders} đơn (${Math.round(totalOrders / listCustomers.value.length * 100)}% tổng khách hàng)`,
                                        top3Customers.value.filter(c => c.TongDonHang >= 10).length > 0 ?
                                            `Có ${top3Customers.value.filter(c => c.TongDonHang >= 10).length} khách hàng VIP (≥10 đơn)` :
                                            'Chưa có khách hàng đạt mức VIP (≥10 đơn)'
                                    ],
                                    style: 'analysisList'
                                }
                            ]
                        },

                        // Footer
                        {
                            stack: [
                                {
                                    canvas: [
                                        {
                                            type: 'line',
                                            x1: 0, y1: 0,
                                            x2: 515, y2: 0,
                                            lineWidth: 1,
                                            lineColor: '#333'
                                        }
                                    ],
                                    margin: [0, 20, 0, 10]
                                },
                                {
                                    text: 'Ghi chú: Danh sách được sắp xếp theo số lượng đơn hàng từ cao xuống thấp',
                                    style: 'note',
                                    margin: [0, 0, 0, 5]
                                },
                                {
                                    text: `Thời gian xuất báo cáo: ${new Date().toLocaleString('vi-VN')}`,
                                    style: 'footer'
                                }
                            ]
                        }
                    ],
                    styles: {
                        header: {
                            fontSize: 20,
                            bold: true,
                            alignment: 'center',
                            color: '#333'
                        },
                        subheader: {
                            fontSize: 11,
                            alignment: 'center',
                            color: '#666',
                            margin: [0, 2, 0, 2]
                        },
                        title: {
                            fontSize: 18,
                            bold: true,
                            alignment: 'center',
                            color: '#2c3e50'
                        },
                        dateInfo: {
                            fontSize: 12,
                            alignment: 'center',
                            color: '#7f8c8d'
                        },
                        sectionHeader: {
                            fontSize: 16,
                            bold: true,
                            color: '#34495e',
                            alignment: 'center',
                            background: '#ecf0f1',
                            margin: [0, 5, 0, 5]
                        },
                        analysisHeader: {
                            fontSize: 14,
                            bold: true,
                            color: '#2c3e50',
                            background: '#f8f9fa',
                            margin: [0, 5, 0, 5]
                        },
                        statLabel: {
                            fontSize: 10,
                            color: '#7f8c8d',
                            bold: true
                        },
                        statNumber: {
                            fontSize: 18,
                            color: '#27ae60',
                            bold: true,
                            margin: [0, 2, 0, 0]
                        },
                        rankNumber: {
                            fontSize: 18,
                            bold: true,
                            border: [2, 2, 2, 2],
                            borderRadius: 5
                        },
                        rankLabel: {
                            fontSize: 8,
                            bold: true
                        },
                        customerName: {
                            fontSize: 15,
                            bold: true,
                            color: '#2c3e50'
                        },
                        customerCode: {
                            fontSize: 10,
                            color: '#7f8c8d',
                            italics: true
                        },
                        orderCountLabel: {
                            fontSize: 8,
                            color: '#7f8c8d',
                            bold: true
                        },
                        orderCountNumber: {
                            fontSize: 20,
                            color: '#e74c3c',
                            bold: true,
                            margin: [0, 2, 0, 0]
                        },
                        orderCountUnit: {
                            fontSize: 8,
                            color: '#95a5a6'
                        },
                        labelWithIcon: {
                            fontSize: 10,
                            color: '#7f8c8d',
                            bold: true
                        },
                        infoText: {
                            fontSize: 10,
                            color: '#2c3e50'
                        },
                        dateText: {
                            fontSize: 10,
                            color: '#3498db'
                        },
                        vipText: {
                            fontSize: 10,
                            color: '#f39c12',
                            bold: true
                        },
                        loyalText: {
                            fontSize: 10,
                            color: '#27ae60',
                            bold: true
                        },
                        normalText: {
                            fontSize: 10,
                            color: '#95a5a6'
                        },
                        rankText: {
                            fontSize: 10,
                            color: '#8e44ad',
                            bold: true
                        },
                        analysisList: {
                            fontSize: 10,
                            color: '#2c3e50',
                            margin: [15, 0, 0, 0]
                        },
                        note: {
                            fontSize: 9,
                            italics: true,
                            color: '#7f8c8d'
                        },
                        footer: {
                            fontSize: 9,
                            alignment: 'right',
                            color: '#95a5a6'
                        }
                    }
                };
                const fileName = `BaoCao_Top3KhachHang_${new Date().toISOString().split('T')[0]}.pdf`;
                pdfMake.createPdf(docDefinition).download(fileName);
                showNotification('Xuất báo cáo TOP 3 khách hàng thành công!', 'success');
            } catch (error) {
                console.error('Lỗi khi xuất PDF:', error);
                showNotification('Lỗi khi xuất báo cáo PDF!', 'error');
            }
        }
    });
};

const getRowClass = (index) => {
    if (index === 0) return 'bg-[#F0F8FF]';
    if (index === 1) return 'bg-[#F0FFFF]';
    if (index === 2) return 'bg-orange-50';
    return '';
};

const getNameClass = (index) => {
    if (index === 0) return 'font-bold text-[#007FFF]';
    if (index === 1) return 'font-bold text-[#01796F]';
    if (index === 2) return 'font-bold text-[#A52A2A]';
    return '';
};

const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' };
    const formattedDate = date.toLocaleDateString('vi-VN', options);

    return formattedDate;
};

onMounted(() => {
    fetchCustomers();
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
                        <h1 class="font-bold text-[20px] uppercase">Quản lý khách hàng</h1>
                        <div class="flex gap-4 items-center">
                            <div class="relative flex justify-center flex-1 gap-2 max-w-xl">
                                <input type="text" v-model="searchValue"
                                    class="items-center w-full p-3 bg-white border pr-10 border-gray-400 text-[12px] font-semibold tracking-wider text-black rounded-md focus:outline-none"
                                    placeholder="Tìm kiếm khách hàng theo tên ..." />
                                <i
                                    class="fa-solid fa-magnifying-glass absolute top-2 lg:top-3 right-3 text-[22px] text-[#003171]"></i>
                            </div>
                            <button @click="exportTop3CustomersPDF"
                                class="bg-[#003171] text-white px-4 py-3 rounded-md text-sm font-semibold transition-colors flex items-center gap-2">
                                Xuất File Top 3</button>
                        </div>
                    </div>
                    <div class="shadow-lg border-2 border-gray-300 overflow-auto">
                        <table class="w-full bg-white whitespace-nowrap text-center text-gray-500">
                            <thead class="bg-[#1A1D27] text-white">
                                <tr>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">TOP</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã khách hàng</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tên khách hàng</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Email</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Ngày tham gia</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tổng đơn hàng</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Đơn đã hủy</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tình trạng</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Điều chỉnh</th>
                                </tr>
                            </thead>
                            <tbody class="w-full">
                                <tr class="border-t border-slate-500" v-for="(customer, index) in findNameCustomers"
                                    :key="index" :class="getRowClass(index)">
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[14px]">
                                        <span :class="getNameClass(index)" class="rounded-full font-bold">
                                            {{ index + 1 }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">
                                        {{ customer.MaKhachHang }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis"
                                        :class="getNameClass(index)">
                                        {{ customer.TenKhachHang }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ customer.Email }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ formatDate(customer.NgayTao) }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis"
                                        :class="getNameClass(index)">
                                        {{ customer.TongDonHang }} đơn hàng
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis"
                                        :class="getNameClass(index)">
                                        {{ customer.TongDonHangDaHuy }} đơn hàng
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis"
                                        :class="getNameClass(index)">
                                        {{ customer.TinhTrangTaiKhoan }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis"
                                        :class="getNameClass(index)">
                                        <button
                                            @click="toggleAccount(customer.TinhTrangTaiKhoan, customer.MaKhachHang, customer.Email, customer)"
                                            class="inline-block text-white font-medium bg-[#003171] py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#1c5ab2] whitespace-nowrap"><i
                                                class="fa-solid fa-repeat"></i></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-if="showReasonDialog" @click="closeReasonDialog"
                        class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div @click.stop
                            class="bg-white backdrop-blur-sm rounded-2xl border border-gray-600/30 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-fadeInUp">

                            <div class="p-6 pb-4 border-b border-gray-600/30 flex-shrink-0">
                                <div class="flex items-center justify-between">
                                    <h2 class="font-bold text-xl flex items-center gap-3">
                                        <div
                                            class="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all duration-200">
                                            <i class="fa-solid fa-ban text-red-500"></i>
                                        </div>
                                        Khóa tài khoản: {{ currentCustomer?.TenKhachHang }}
                                    </h2>
                                    <button @click="closeReasonDialog"
                                        class="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 text-[#DC143C] transition-all duration-200 flex items-center justify-center">
                                        <i class="fa-solid fa-times text-lg"></i>
                                    </button>
                                </div>
                                <hr class="my-4 border-gray-600/30">
                                <div class="flex flex-col items-start gap-4">
                                    <div class="mb-2">
                                        <p class="text-[18px] font-semibold mb-1">Thông tin khách hàng:</p>
                                        <p class="text-[14px]">Mã khách hàng: <span class="font-semibold">{{ currentCustomer?.maKhachHang }}</span>
                                        </p>
                                        <p class="text-[14px]">Email: <span class="font-semibold">{{ currentCustomer?.email }}</span></p>
                                    </div>
                                    <div class="w-full">
                                        <p class="text-[18px] font-semibold mb-3">Chọn lý do khóa tài khoản:
                                        </p>
                                        <div class="space-y-3">
                                            <div class="flex gap-3 items-center hover:bg-gray-600/20 p-2 rounded-lg transition-all duration-200"
                                                v-for="(reason, index) in listReasons" :key="index">
                                                <input type="radio"
                                                    class="cursor-pointer w-4 h-4 text-red-600 border-2 border-gray-400 focus:ring-red-500"
                                                    :id="reason.value" :value="reason.value" v-model="selectedReason">
                                                <label :for="reason.value"
                                                    class="font-medium text-[16px] cursor-pointer flex-1 select-none">
                                                    {{ reason.title }}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex justify-end items-center mt-6 pt-4 border-t border-gray-600/30">
                                    <button @click="handleReasonSubmit" :disabled="!selectedReason"
                                        class="px-5 py-2 rounded-md text-white transition-all duration-200 flex items-center gap-2"
                                        :class="selectedReason ? 'bg-[#DC143C] hover:bg-[#DC143C]/70' : 'bg-gray-500/50 cursor-not-allowed'">
                                        Khóa tài khoản
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <NotificationAdmin :message="notification.message" :type="notification.type" />
            </div>
        </div>
        <ConfirmDialog :visible="dialogState.visible" :title="dialogState.title" :message="dialogState.message"
            :type="dialogState.type" :confirmText="dialogState.confirmText" :cancelText="dialogState.cancelText"
            @confirm="handleDialogConfirm" @cancel="handleDialogCancel" @close="handleDialogClose" />
    </div>
</template>

<style scoped>
.active-link {
    background: #DB3F4C;
    color: white;
}
</style>