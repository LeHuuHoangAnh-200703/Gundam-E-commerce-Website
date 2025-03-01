const Inventory = require("../models/inventoryModels");
const Product = require("../models/productModels");

exports.getAllInventories = async (req, res) => {
    try {
        const inventories = await Inventory.find();

        const productIds = [...new Set(inventories.map(inventory => inventory.MaSanPham))];

        const products = await Product.find({ MaSanPham: { $in: productIds } });
        const productMap = {};
        products.forEach(product => {
            productMap[product.MaSanPham] = {
                TenSanPham: product.TenSanPham,
            };
        });

        const productsWithInventories = inventories.map(inventory => ({
            ...inventory.toObject(),
            TenSanPham: productMap[inventory.MaSanPham]?.TenSanPham,
        }));

        return res.status(200).json(productsWithInventories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};