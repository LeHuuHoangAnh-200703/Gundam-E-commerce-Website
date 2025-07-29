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

const findNameCustomers = computed(() => {
    if (!searchValue.value) {
        return listCustomers.value;
    }
    return listCustomers.value.filter(customer => {
        return customer.TenKhachHang.toLowerCase().includes(searchValue.value);
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
                                        `Tổng đơn hàng của TOP 3: ${totalOrders} đơn (${Math.round(totalOrders/listCustomers.value.length*100)}% tổng khách hàng)`,
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
                                </tr>
                            </tbody>
                        </table>
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