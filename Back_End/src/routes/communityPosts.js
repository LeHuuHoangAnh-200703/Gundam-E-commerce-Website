const express = require('express');
const router = express.Router();
const communityPostController = require('../controllers/communityPostController');

router.get("/", communityPostController.getAllCommunityPost);
router.get("/:maBaiDang", communityPostController.getCommunityPost);
router.post("/", communityPostController.upload ,communityPostController.createCommunityPost);
router.post("/yeuthich/:maBaiDang", communityPostController.likeCommunityPost);
router.post("/binhluan/:maBaiDang", communityPostController.commentCommunityPost);
router.post("/traloibinhluan/:maBaiDang/:maBinhLuan", communityPostController.replyComment);
router.delete("/:maBaiDang", communityPostController.deleteCommunityPost);
router.delete("/xoabinhluan/:maBaiDang/:maBinhLuan", communityPostController.deleteComment);

module.exports = router;