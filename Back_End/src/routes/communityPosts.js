const express = require('express');
const router = express.Router();
const communityPostController = require('../controllers/communityPostController');

router.get("/", communityPostController.getAllCommunityPost);
router.get("/:maBaiDang", communityPostController.getCommunityPost);
router.get("/danhsachbaidang/:maKhachHang", communityPostController.getCommunityPostById);
router.post("/", communityPostController.upload ,communityPostController.createCommunityPost);
router.post("/binhluan/:maBaiDang", communityPostController.commentCommunityPost);
router.post("/traloibinhluan/:maBaiDang/:maBinhLuan", communityPostController.replyComment);
router.delete("/xoabaidang/:maBaiDang", communityPostController.deleteCommunityPost);
router.delete("/xoabinhluan/:maBaiDang/:maBinhLuan", communityPostController.deleteComment);
router.patch("/:maBaiDang", communityPostController.updateStatus);
router.get("/top/topbinhluan", communityPostController.getTopCommunityPost);
router.put("/baocao/:maBaiDang", communityPostController.report);
router.patch("/anbaidang/:maBaiDang", communityPostController.hiddenPost);

module.exports = router;