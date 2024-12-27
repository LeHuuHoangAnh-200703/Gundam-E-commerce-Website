const Notification = require("../models/notificationModels");

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      MaThongBao: req.params.maTB,
    });
    if (!notification) {
      res.status(400).json({ message: "Thông báo không tồn tại!" });
    }
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createNotification = async (req, res) => {
  const notification = new Notification(req.body);
  try {
    await notification.save();
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};