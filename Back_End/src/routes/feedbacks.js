const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackControllers');

router.get("/", feedbackController.getAllFeedBacks);
router.get("/:maDanhGia", feedbackController.getFeedBack);
router.post("/", feedbackController.createFeedBack);
router.delete("/:maDanhGia", feedbackController.deleteFeedBack);

module.exports = router;