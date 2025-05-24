const CommunityPost = require("../models/communityPostModels");
const Customer = require("../models/customersModels");
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
    const posts = await CommunityPost.find();
    const customerIds = [...new Set(posts.map(post => post.MaKhachHang))];

    const customers = await Customer.find({ MaKhachHang: { $in: customerIds } });
    const customerMap = {};
    customers.forEach(customer => {
      customerMap[customer.MaKhachHang] = {
        TenKhachHang: customer.TenKhachHang,
        HinhAnhKhachHang: customer.Image
      };
    });

    const communityPost = posts.map(post => ({
      ...post.toObject(),
      TenKhachHang: customerMap[post.MaKhachHang]?.TenKhachHang || "Không xác định",
      HinhAnhKhachHang: customerMap[post.MaKhachHang]?.HinhAnhKhachHang || null
    }));

    res.status(200).json(communityPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.getCommunityPost = async (req, res) => {
  try {
    const post = await CommunityPost.findOne({ MaBaiDang: req.params.maBaiDang });
    if (!post) {
      return res.status(400).json({ message: "Bài đăng không tồn tại!" });
    }

    const customer = await Customer.findOne({ MaKhachHang: post.MaKhachHang });

    // Join Customer cho từng bình luận và xử lý reply
    const binhLuanWithCustomer = await Promise.all(
      post.BinhLuan.map(async (binhLuan) => {
        // Join Customer cho người bình luận
        const commenter = await Customer.findOne({ MaKhachHang: binhLuan.MaKhachHang });

        // Nếu là reply, tìm bình luận cha và lấy TenKhachHang
        let replyToTenKhachHang = null;
        if (binhLuan.TraLoiCho) {
          const parentComment = post.BinhLuan.find(
            (c) => c.MaBinhLuan === binhLuan.TraLoiCho
          );
          if (parentComment) {
            const parentCustomer = await Customer.findOne({
              MaKhachHang: parentComment.MaKhachHang,
            });
            replyToTenKhachHang = parentCustomer
              ? parentCustomer.TenKhachHang
              : "Không xác định";
          }
        }

        return {
          ...binhLuan._doc,
          TenKhachHang: commenter ? commenter.TenKhachHang : "Không xác định",
          HinhAnhKhachHang: commenter ? commenter.Image : null,
          ReplyToTenKhachHang: replyToTenKhachHang,
        };
      })
    );

    const communityPost = {
      ...post._doc,
      TenKhachHang: customer ? customer.TenKhachHang : "Không xác định",
      HinhAnhKhachHang: customer ? customer.Image : null,
      BinhLuan: binhLuanWithCustomer,
    };

    res.status(200).json(communityPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
  const MaKhachHang = req.body.MaKhachHang;
  try {
    const communityPost = await CommunityPost.findOne({ MaBaiDang: req.params.maBaiDang });
    const hasLike = communityPost.MaKhachHangDaThich.includes(MaKhachHang);
    if (!communityPost) {
      return res.status(400).json({ message: "Bài đăng không tồn tại!" });
    }
    if (hasLike) {
      communityPost.MaKhachHangDaThich = communityPost.MaKhachHangDaThich.filter(id => id !== MaKhachHang);
    } else {
      communityPost.MaKhachHangDaThich.push(MaKhachHang);
    }

    await communityPost.save();
    res.status(200).json({
      post: {
        ...communityPost._doc,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const bannedWords = [
  "ngu",
  "đần",
  "ngu dốt",
  "khốn nạn",
  "vô học",
  "đồ rác rưởi",
  "thằng", "con", "mày", "đồ dốt", "đồ điên",
  "chết tiệt", "vô dụng", "vứt đi", "tởm", "thảm họa", "đồ rác", "tệ hại", "Địt", "đéo", "cái đéo gì", "đm", "dm", "vkl", "vcl", "cc", "đm nó", "con cat", "con cac",
  "M nó", "đồ cút", "thằng chó", "Con mẹ nó", "chết mẹ", "bố mày", "cmm", "vl", "Thằng chó", "đồ chó", "đồ con chó", "Đồ mạt hạng", "đồ vô học", "đồ khốn", "đồ tồi tệ", "đồ bẩn thỉu", "óc chó", "Thằng lừa đảo", "đồ thất đức", "Lìn", "ln", "đụ", "đm mày", "đệch", "vãi cả chưởng", "đồ như ct", "Đ mày", "dmtt", "cmnr"
];

const containsBannedWords = (text) => {
  return bannedWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(text));
};

exports.commentCommunityPost = async (req, res) => {
  const { MaKhachHang, NoiDungBinhLuan } = req.body;

  if (containsBannedWords(NoiDungBinhLuan)) {
    return res.status(400).json({ message: "Binh luận chứa nội dung không phù hợp!" });
  }

  try {
    const communityPost = await CommunityPost.findOne({ MaBaiDang: req.params.maBaiDang });
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
    console.log(error.message)
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

exports.updateStatus = async (req, res) => {
  const { TrangThaiDang } = req.body;
  try {
    const updatedStatus = await CommunityPost.findOne({ MaBaiDang: req.params.maBaiDang });

    if (!updatedStatus) {
      return res.status(404).json({ message: "Bài đăng không tồn tại!" });
    }
    updatedStatus.TrangThaiDang = TrangThaiDang;
    await updatedStatus.save();
    res.status(200).json({ message: "Duyệt bài thành công." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.upload = upload.array('HinhAnh', 4);