# Mô hình Cơ sở Dữ liệu - Hệ thống E-commerce Gundam

## Sơ đồ ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    %% Bảng chính - Quản lý người dùng
    CUSTOMERS {
        string MaKhachHang PK
        string TenKhachHang
        string Email
        string MatKhau
        string Image
        date NgayTao
        array DanhSachDiaChi
        array DanhSachMaGiamGia
        number TrangThai
        string provider
        string providerId
    }

    ADMINS {
        string MaAdmin PK
        string TenAdmin
        string Email
        string MatKhau
        date NgayTao
        number TrangThaiHoatDong
        string ChucVu
    }

    %% Bảng sản phẩm và danh mục
    PRODUCTS {
        string MaSanPham PK
        string TenSanPham
        string GiaBan
        number GiaSale
        string MaLoaiSanPham FK
        string MaNhaCungCap FK
        number LuotBan
        string MoTa
        array Images
        string YoutubeUrl
        string TinhNang
        string BarCode
        date NgayBan
        string TrangThai
    }

    PRODUCT_TYPES {
        string MaLoaiSanPham PK
        string TenLoaiSanPham
        string LoaiSanPham
        date NgayTao
    }

    SUPPLIERS {
        string MaNhaCungCap PK
        string TenNhaCungCap
        string DienThoai
        string DiaChi
    }

    INVENTORY {
        string MaSanPham PK,FK
        number SoLuongTon
        number GiaNhapGanNhat
        date NgayCapNhat
    }

    %% Bảng giỏ hàng và đơn hàng
    CART {
        string MaGioHang PK
        string MaKhachHang FK
        string MaSanPham FK
        number SoLuong
    }

    ORDERS {
        string MaDonHang PK
        string MaKhachHang FK
        array DiaChiNhanHang
        array SanPhamDaMua
        string IdMaGiamGia FK
        string HinhThucThanhToan
        number TongDon
        string GhiChu
        date NgayDatHang
        string HinhThucVanChuyen
        string TrangThaiThanhToan
        string TransactionId
        string TrangThaiDon
    }

    DISCOUNT_CODES {
        string IdMaGiamGia PK
        string TenMaGiamGia
        string GiaApDung
        string GiamTien
        number GiamPhanTram
        number SoLanSuDung
        date NgayHetHan
        number SoLanLuuMa
        array IdKhachHangSuDung
        date NgayTao
    }

    %% Bảng đánh giá và phản hồi
    FEEDBACKS {
        string MaDanhGia PK
        number ChatLuong
        string MaKhachHang FK
        string MaDonHang FK
        string MoTa
        array HinhAnhSanPham
        date NgayDang
        array SanPhamDaDanhGia
        boolean isToxic
    }

    %% Bảng cộng đồng
    COMMUNITY_POSTS {
        string MaBaiDang PK
        string MaKhachHang FK
        string TieuDe
        string NoiDung
        array HinhAnh
        string LoaiBaiDang
        array BinhLuan
        string TrangThaiDang
        array IdKhachHangDaBaoCao
        array LyDoBaoCao
        date ThoiGianDang
    }

    %% Bảng thông báo và chat
    NOTIFICATIONS {
        string MaThongBao PK
        string ThongBao
        string NguoiChinhSua
        date ThoiGian
    }

    CHATBOT {
        string MaChat PK
        string NoiDung
        string MaKhachHang FK
        string NguoiGui
        date ThoiGianGui
    }

    MESSAGES {
        string roomCode PK
        string senderId FK
        string receiverId FK
        string receiverName
        array messages
        array senderMessagesNotRead
        array receiverMessagesNotRead
    }

    %% Bảng quản lý nhập hàng
    ENTRY_FORMS {
        string MaPhieuNhap PK
        string MaNhaCungCap FK
        string TenNhaCungCap
        string MaNhanVien
        string TenNhanVien
        date NgayNhap
    }

    ENTRY_FORM_INFOS {
        string MaChiTietPhieuNhap PK
        string MaPhieuNhap FK
        string MaSanPham FK
        string TenSanPham
        string GiaNhap
        number SoLuong
        string TongTien
        date NgayNhap
    }

    %% Bảng xác thực và địa chỉ
    OTP {
        string email PK
        string otp
        date createdAt
        date expiresAt
    }

    PROVINCES {
        string Id PK
        string Name
        array Districts
    }

    %% Mối quan hệ
    CUSTOMERS ||--o{ CART : "có"
    CUSTOMERS ||--o{ ORDERS : "đặt"
    CUSTOMERS ||--o{ FEEDBACKS : "đánh giá"
    CUSTOMERS ||--o{ COMMUNITY_POSTS : "đăng"
    CUSTOMERS ||--o{ CHATBOT : "chat"
    CUSTOMERS ||--o{ MESSAGES : "nhắn tin"

    PRODUCTS }o--|| PRODUCT_TYPES : "thuộc"
    PRODUCTS }o--|| SUPPLIERS : "cung cấp"
    PRODUCTS ||--|| INVENTORY : "tồn kho"

    CART }o--|| PRODUCTS : "chứa"
    ORDERS }o--|| DISCOUNT_CODES : "sử dụng"
    ORDERS }o--|| PRODUCTS : "mua"

    ENTRY_FORMS }o--|| SUPPLIERS : "nhập từ"
    ENTRY_FORMS ||--o{ ENTRY_FORM_INFOS : "chi tiết"
    ENTRY_FORM_INFOS }o--|| PRODUCTS : "sản phẩm"
```

## Mô tả chi tiết các bảng

### 1. Bảng Quản lý Người dùng
- **CUSTOMERS**: Lưu thông tin khách hàng
- **ADMINS**: Lưu thông tin quản trị viên
- **OTP**: Lưu mã OTP xác thực email

### 2. Bảng Sản phẩm và Danh mục
- **PRODUCTS**: Thông tin sản phẩm Gundam
- **PRODUCT_TYPES**: Phân loại sản phẩm
- **SUPPLIERS**: Nhà cung cấp
- **INVENTORY**: Quản lý tồn kho

### 3. Bảng Mua bán
- **CART**: Giỏ hàng của khách hàng
- **ORDERS**: Đơn hàng
- **DISCOUNT_CODES**: Mã giảm giá

### 4. Bảng Đánh giá và Cộng đồng
- **FEEDBACKS**: Đánh giá sản phẩm
- **COMMUNITY_POSTS**: Bài đăng cộng đồng

### 5. Bảng Thông báo và Chat
- **NOTIFICATIONS**: Thông báo hệ thống
- **CHATBOT**: Lịch sử chat với bot
- **MESSAGES**: Tin nhắn giữa người dùng

### 6. Bảng Quản lý Nhập hàng
- **ENTRY_FORMS**: Phiếu nhập hàng
- **ENTRY_FORM_INFOS**: Chi tiết phiếu nhập

### 7. Bảng Địa chỉ
- **PROVINCES**: Quản lý địa chỉ (Tỉnh/Huyện/Xã)

## Đặc điểm chính của hệ thống

1. **Quản lý đa vai trò**: Khách hàng và Admin
2. **Hệ thống giỏ hàng**: Quản lý đơn hàng chi tiết
3. **Tích hợp thanh toán**: VNPay, mã giảm giá
4. **Cộng đồng**: Bài đăng, bình luận, đánh giá
5. **Chat và thông báo**: Tương tác real-time
6. **Quản lý kho**: Nhập hàng, tồn kho
7. **Bảo mật**: Mã hóa mật khẩu, OTP xác thực
8. **Đa nền tảng**: Hỗ trợ đăng nhập Google

## Các khóa chính và quan hệ

- **Khóa chính**: Tất cả các bảng đều có khóa chính tự động sinh
- **Khóa ngoại**: Liên kết giữa các bảng theo logic nghiệp vụ
- **Mảng dữ liệu**: Sử dụng cho danh sách địa chỉ, hình ảnh, bình luận
- **Timestamps**: Tự động cập nhật thời gian tạo/cập nhật 