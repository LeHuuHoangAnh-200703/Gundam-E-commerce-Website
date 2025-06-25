const Inventory = require("../models/inventoryModels");
const Product = require("../models/productModels");
const EntryForm = require("../models/entryFormModels");
const EntryFormInfo = require("../models/entryFormInfoModels");
const Supplier = require("../models/suppliersModels");

exports.getProductByBarCode = async (req, res) => {
    try {
        const { barcode } = req.params;
        const product = await Product.findOne({ BarCode: barcode });
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        const inventory = await Inventory.findOne({ MaSanPham: product.MaSanPham });
        let MaNhaCungCap = product.MaNhaCungCap;
        let TenNhaCungCap = null;
        if (MaNhaCungCap) {
            const supplier = await Supplier.findOne({ MaNhaCungCap: MaNhaCungCap });
            TenNhaCungCap = supplier ? supplier.TenNhaCungCap : null;
        }

        res.status(200).json({
            MaSanPham: product.MaSanPham,
            TenSanPham: product.TenSanPham,
            SoLuongTon: inventory ? inventory.SoLuongTon : 0,
            GiaNhapGanNhat: inventory ? inventory.GiaNhapGanNhat : 0,
            barcode: product.BarCode,
            MaNhaCungCap,
            TenNhaCungCap,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.addStock = async (req, res) => {
    try {
        const {
            barcode,
            SoLuongNhap,
            GiaNhap,
            MaNhaCungCap,
            TenNhaCungCap,
            MaNhanVien,
            TenNhanVien,
        } = req.body;

        // Tìm sản phẩm
        const product = await Product.findOne({ BarCode: barcode });
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }
        let inventory = await Inventory.findOne({ MaSanPham: product.MaSanPham });

        // Lấy ngày hiện tại (chỉ ngày, không giờ)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Kiểm tra phiếu nhập đã tồn tại trong ngày với cùng nhà cung cấp
        let entryForm = await EntryForm.findOne({
            MaNhaCungCap,
            TenNhaCungCap,
            NgayNhap: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
        });

        // Nếu chưa tồn tại, tạo phiếu nhập mới
        if (!entryForm) {
            entryForm = new EntryForm({
                MaNhaCungCap,
                TenNhaCungCap,
                MaNhanVien,
                TenNhanVien,
                NgayNhap: new Date(),
            });
            await entryForm.save();
        }

        // Tạo hoặc cập nhật chi tiết phiếu nhập
        const existingDetail = await EntryFormInfo.findOne({
            MaPhieuNhap: entryForm.MaPhieuNhap,
            MaSanPham: product.MaSanPham,
        });
        if (existingDetail) {
            existingDetail.SoLuong += SoLuongNhap;
            existingDetail.GiaNhap = GiaNhap.toString();
            existingDetail.TongTien = (GiaNhap * existingDetail.SoLuong).toString();
            await existingDetail.save();
        } else {
            const entryFormInfo = new EntryFormInfo({
                MaPhieuNhap: entryForm.MaPhieuNhap,
                MaSanPham: product.MaSanPham,
                TenSanPham: product.TenSanPham,
                GiaNhap: GiaNhap.toString(),
                SoLuong: SoLuongNhap,
                TongTien: (GiaNhap * SoLuongNhap).toString(),
                NgayNhap: new Date(),
            });
            await entryFormInfo.save();
        }

        // Cập nhật hoặc tạo tồn kho
        if (inventory) {
            inventory.SoLuongTon += SoLuongNhap;
            inventory.GiaNhapGanNhat = GiaNhap;
            inventory.NgayCapNhat = new Date();
        } else {
            inventory = new Inventory({
                MaSanPham: product.MaSanPham,
                SoLuongTon: SoLuongNhap,
                GiaNhapGanNhat: GiaNhap,
                NgayCapNhat: new Date(),
            });
        }
        await inventory.save();

        res.status(200).json({
            message: 'Nhập kho thành công',
            entryForm,
            entryFormInfo: existingDetail,
            inventory,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};