const CommunityPost = require("../models/communityPostModels");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dwcajbc6f',
  api_key: '365476741985665',
  api_secret: '6gAWhCMdI8DfBAs-1ZDwwx1xM0Y'
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.getAllCommunityPost = async (req, res) => {
  try {
    const communityPost = await CommunityPost.find();
    res.status(200).json(communityPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.getCommunityPost = async (req, res) => {
  try {
    const communityPost = await CommunityPost.findOne({ MaBaiDang: req.params.maBaiDang});
    if (!communityPost) {
      return res.status(400).json({ message: "Bài đăng không tồn tại!"});
    }
    res.status(200).json(communityPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.createCommunityPost = async (req, res) => {
  if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files were uploaded.' });
    }
  
    const imageUploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'communityPost',
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          });
        stream.end(file.buffer); // Kết thúc stream với buffer
      });
    });
  
    try {
      const imageUploadResults = await Promise.all(imageUploadPromises); // Chờ tất cả hình ảnh được upload
      const communityPost = new CommunityPost({
        ...req.body,
        HinhAnh: imageUploadResults.map(result => result.secure_url)
      });
      await communityPost.save();
      res.status(200).json(communityPost);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
}

exports.likeCommunityPost = async (req, res) => {
  const maBaiDang = req.params;
  const maKhachHang = req.body;

  try {
    const communityPost = await CommunityPost.findOne({ MaBaiDang: maBaiDang });
    if (!communityPost) {
      return res.status(400).json({ message: "Bài đăng không tồn tại!"});
    }
    if (communityPost.MaKhachHangDaThich.includes(maKhachHang)) {
      return res.status(400).json({ message: "Bạn đã thích bài đăng này rồi!" });
    }
    communityPost.MaKhachHangDaThich.push(maKhachHang);
    communityPost.LuotThich = MaKhachHangDaThich.length;
    await communityPost.save();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.comment = async (req, res) => {
  const maBaiDang = req.params;
  const { MaKhachHang, NoiDungBinhLuan } = req.body;

  try {
    const communityPost = await CommunityPost.findOne({ MaBaiDang: maBaiDang });
    if (!communityPost) {
      return res.status(400).json({ message: "Bài đăng không tồn tại!" });
    }
    const MaBinhLuan = 'BLuan' + Math.floor(10000 + Math.random() * 90000);

    const post = {
      MaBinhLuan,
      MaKhachHang,
      NoiDungBinhLuan,
      ThoiGian: new Date()
    }

    communityPost.BinhLuan.push(post);
    await communityPost.save();
    res.status(200).json(communityPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.replyComment = async (req, res) => {
  const { maBaiDang, maBinhLuan } = req.params;
  const { MaKhachHang, NoiDungBinhLuan } = req.body;

  try {
    const communityPost = await CommunityPost.findOne({ MaBaiDang: maBaiDang });
    const comment = communityPost.BinhLuan.find(comment => comment.MaBinhLuan === maBinhLuan);
    if (!communityPost) {
      return res.status(400).json({ message: "Bài đăng không tồn tại!" });
    }
    if (!comment) {
      return res.status(400).json({ message: "Bình luận không tồn tại!" });
    }

    const MaBinhLuan = 'BLuan' + Math.floor(10000 + Math.random() * 90000);
    const post = {
      MaBinhLuan,
      MaKhachHang,
      NoiDungBinhLuan,
      TraLoiCho: maBinhLuan, // Lưu MaBinhLuan của bình luận cha
      ThoiGian: new Date()
    }
    
    communityPost.BinhLuan.push(post);
    await communityPost.save();
    res.status(200).json(communityPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.deleteCommunityPost = async (req, res) => {
  const maBaiDang = req.params;
  const MaKhachHang = req.body;
  try {
    const communityPost = await CommunityPost.findOne({ MaBaiDang: maBaiDang });
    if (!communityPost) {
      return res.status(400).json({ message: "Bài đăng không tồn tại!" });
    }

    if (communityPost.MaKhachHang !== MaKhachHang) {
      return res.status(400).json({ message: "Bạn không có quyền xóa bài đăng này!" });
    }

    // Xóa tất cả hình ảnh trên Cloudinary nếu có
    if (communityPost.HinhAnh && communityPost.HinhAnh.length > 0) {
      const destroyPromises = communityPost.HinhAnh.map(async (imageUrl) => {
        const publicId = imageUrl.split('/').pop().split('.')[0]; // Lấy public_id từ URL
        return cloudinary.uploader.destroy(`communityPost/${publicId}`);
      });
      await Promise.all(destroyPromises);
    }

    const delelePost = await CommunityPost.findOneAndUpdate({ MaBaiDang: maBaiDang });

    res.status(200).json({ message: "Xóa bài đăng thành công!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.deleteComment = async (req, res) => {
  const { maBaiDang, maBinhLuan } = req.params;
  const { MaKhachHang } = req.body;
  try {
    const communityPost = await CommunityPost.findOne({ MaBaiDang: maBaiDang });
    if (!communityPost) {
      return res.status(400).json({ message: "Bài đăng không tồn tại!" });
    }

    const comment = communityPost.BinhLuan.find(c => c.MaBinhLuan === maBinhLuan);
    if (!comment) {
      return res.status(400).json({ message: "Bình luận không tồn tại!" });
    }

    // Kiểm tra quyền xóa (chỉ người tạo bình luận được xóa)
    if (comment.MaKhachHang !== MaKhachHang) {
      return res.status(400).json({ message: "Bạn không có quyền xóa bình luận này!" });
    }

    // Xóa bình luận và các trả lời liên quan
    communityPost.BinhLuan = communityPost.BinhLuan.filter(
      c => c.MaBinhLuan !== maBinhLuan && c.TraLoiCho !== maBinhLuan
    );

    await communityPost.save();
    res.json({ message: "Xóa bình luận thành công!", post: communityPost });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa bình luận: " + error.message });
  }
};

exports.upload = upload.array('HinhAnh', 4);