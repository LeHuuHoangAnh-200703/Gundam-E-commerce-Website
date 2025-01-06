const Inventory = require("../models/inventoryModels");

exports.getAllInventories = async (req, res) => {
    try {
        const inventories = await Inventory.find();
        res.status(200).json(inventories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};