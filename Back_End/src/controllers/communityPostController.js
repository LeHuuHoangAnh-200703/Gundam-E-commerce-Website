const CommunityPost = require("../models/communityPostModels");
const Customer = require("../models/customersModels");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const axios = require('axios');

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
        HinhAnhKhachHang: customer.Image,
        Email: customer.Email
      };
    });

    const communityPost = posts.map(post => ({
      ...post.toObject(),
      TenKhachHang: customerMap[post.MaKhachHang]?.TenKhachHang || "Không xác định",
      HinhAnhKhachHang: customerMap[post.MaKhachHang]?.HinhAnhKhachHang || null,
      EmailTacGia: customerMap[post.MaKhachHang]?.Email || null
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
      EmailKhachHang: customer ? customer.Email : 'Không xác định',
      BinhLuan: binhLuanWithCustomer,
    };

    res.status(200).json(communityPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCommunityPostById = async (req, res) => {
  try {
    const posts = await CommunityPost.find({ MaKhachHang: req.params.maKhachHang });
    const customerIds = [...new Set(posts.map(post => post.MaKhachHang))];

    const customers = await Customer.find({ MaKhachHang: { $in: customerIds } });
    const customerMap = {};
    customers.forEach(customer => {
      customerMap[customer.MaKhachHang] = {
        TenKhachHang: customer.TenKhachHang,
        HinhAnhKhachHang: customer.Image,
        EmailKhachHang: customer.Email
      };
    });

    const communityPost = posts.map(post => ({
      ...post.toObject(),
      TenKhachHang: customerMap[post.MaKhachHang]?.TenKhachHang || "Không xác định",
      HinhAnhKhachHang: customerMap[post.MaKhachHang]?.HinhAnhKhachHang || null,
      EmailKhachHang: customerMap[post.MaKhachHang]?.EmailKhachHang
    }));
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

const bannedWords = [
  "ngu", "đần", "ngu dốt", "khốn nạn", "vô học", "đồ rác rưởi",
  "thằng", "con", "mày", "đồ dốt", "đồ điên", "chết tiệt", "vô dụng",
  "vứt đi", "tởm", "thảm họa", "đồ rác", "tệ hại",
  "địt", "đéo", "cái đéo gì", "đm", "dm", "vkl", "vcl", "cc",
  "đm nó", "con cat", "con cac", "con cặc", "con cặt", "m nó", "đồ cút", "thằng chó",
  "con mẹ nó", "chết mẹ", "bố mày", "cmm", "vl", "thằng chó",
  "đồ chó", "đồ con chó", "đồ mạt hạng", "đồ vô học", "đồ khốn",
  "đồ tồi tệ", "đồ bẩn thỉu", "óc chó", "thằng lừa đảo", "đồ thất đức",
  "lìn", "ln", "đụ", "đm mày", "đệch", "vãi cả chưởng", "đồ như ct",
  "đ mày", "dmtt", "cmnr", "súc vật", "đồ súc vật", "con súc vật", "đồ thú vật", "đồ không người",
  "thằng súc vật", "con thú", "đồ con thú", "đồ ngu si", "đồ đần độn",
  "đồ khờ", "đồ ngốc", "đồ si", "đồ đại ngu", "đồ bị điên",
  "đồ phá hoại", "đồ tàn phá", "đồ hủy hoại", "đồ tệ nạn",
  "đồ quỷ", "đồ ma", "đồ ác quỷ", "đồ quỷ dữ", "đồ tà ma",
  "đồ chết", "đồ chết tiệt", "đồ chết dở", "đồ chết đói",
  "đồ nghiệp", "đồ tội lỗi", "đồ phạm tội", "đồ tội phạm",
  "hạ đẳng", "đồ hạ đẳng", "đồ kém cỏi", "đồ thua kém", "đồ dở hơi",
  "đồ mất dạy", "đồ vô giáo dục", "đồ thô lỗ", "đồ bất lịch sự",
  "đồ vô văn hóa", "đồ man rợ", "đồ dã man", "đồ vô ý thức",
  "đồ bệnh hoạn", "đồ tâm thần", "đồ điên loạn", "đồ rồ dại",
  "đồ khùng", "đồ loạn trí", "đồ mất trí", "đồ rối loạn",
  "đánh chết", "giết chết", "xử chết", "đập chết", "phá chết",
  "bỏ chết", "hành hạ", "tra tấn", "hủy diệt", "tiêu diệt",
  "mẹ mày", "bố mày", "cha mày", "tổ tiên mày", "dòng họ mày",
  "nhà mày", "gia đình mày", "cả nhà mày", "cả dòng họ mày",
  "wtf", "stfu", "kys", "gtfo", "pos", "sob", "mf", "bs",
  "smh", "ffs", "omfg", "jfc", "damn", "hell", "crap", "shit",
  "bitch", "asshole", "moron", "idiot", "stupid", "dumb",
  "thằng ranh", "con ranh", "đồ ranh con", "thằng nhãi", "con nhãi",
  "đồ nhãi", "thằng tồi", "con tồi", "đồ tồi", "thằng xấu",
  "con xấu", "đồ xấu", "thằng ác", "con ác", "đồ ác",
  "đồ vô tích sự", "đồ vô tác dụng", "đồ thừa thãi", "đồ vô nghĩa",
  "đồ phí phạm", "đồ lãng phí", "đồ hại người", "đồ phá đám",
  "đồ quấy rầy", "đồ làm phiền", "đồ gây rối", "đồ làm loạn",
  "xấu xí", "ghê tởm", "kinh tởm", "thảm hại", "dị hợm",
  "biến thái", "quái vật", "đồ quái vật", "thằng quái vật",
  "con quái vật", "đồ dị dạng", "thằng dị dạng", "con dị dạng",
  "loz", "lol", "wtf", "omg", "fck", "fcking", "damn it",
  "go to hell", "shut up", "get lost", "piss off", "buzz off"
];

const containsBannedWords = (text) => {
  return bannedWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(text));
};

const checkToxicContent = async (text) => {
  try {
    const response = await axios.post('http://localhost:5000/predict', { sentence: text });
    const isToxic = response.data.prediction === 1;
    return isToxic;
  } catch (error) {
    console.error('Error calling Flask API:', error.message);
    return false;
  }
};

exports.commentCommunityPost = async (req, res) => {
  const { MaKhachHang, NoiDungBinhLuan } = req.body;

  const isToxic = await checkToxicContent(NoiDungBinhLuan);
  const hasBannedWords = await containsBannedWords(NoiDungBinhLuan);

  if (isToxic) {
    return res
      .status(400)
      .json({ message: "Bình luận chứa nội dung không phù hợp!" });
  } else if (hasBannedWords) {
    return res
      .status(400)
      .json({ message: "Bình luận chứa nội dung không phù hợp!" });
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
  const { NoiDungBinhLuan } = req.body;

  const isToxic = await checkToxicContent(NoiDungBinhLuan);
  const hasBannedWords = containsBannedWords(NoiDungBinhLuan);
  if (isToxic) {
    return res
      .status(400)
      .json({ message: "Bình luận chứa nội dung không phù hợp!" });
  } else if (hasBannedWords) {
    return res
      .status(400)
      .json({ message: "Bình luận chứa nội dung không phù hợp!" });
  }

  try {
    const communityPost = await CommunityPost.findOne({ MaBaiDang: req.params.maBaiDang });
    const comment = communityPost.BinhLuan.find(comment => comment.MaBinhLuan === req.params.maBinhLuan);
    if (!communityPost) {
      return res.status(400).json({ message: "Bài đăng không tồn tại!" });
    }
    if (!comment) {
      return res.status(400).json({ message: "Bình luận không tồn tại!" });
    }

    const MaBinhLuan = 'BLuan' + Math.floor(10000 + Math.random() * 90000);
    const post = {
      MaBinhLuan,
      MaKhachHang: req.body.MaKhachHang,
      NoiDungBinhLuan: req.body.NoiDungBinhLuan,
      TraLoiCho: req.params.maBinhLuan, // Lưu MaBinhLuan của bình luận cha
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
  try {
    const communityPost = await CommunityPost.findOne({ MaBaiDang: req.params.maBaiDang });
    if (!communityPost) {
      return res.status(400).json({ message: "Bài đăng không tồn tại!" });
    }

    // Xóa tất cả hình ảnh trên Cloudinary nếu có
    if (communityPost.HinhAnh && communityPost.HinhAnh.length > 0) {
      const destroyPromises = communityPost.HinhAnh.map(async (imageUrl) => {
        const publicId = imageUrl.split('/').pop().split('.')[0]; // Lấy public_id từ URL
        return cloudinary.uploader.destroy(`communityPost/${publicId}`);
      });
      await Promise.all(destroyPromises);
    }

    await CommunityPost.findOneAndDelete({ MaBaiDang: req.params.maBaiDang });

    res.status(200).json({ message: "Xóa bài đăng thành công!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.deleteComment = async (req, res) => {
  const maBaiDang = req.params.maBaiDang;
  const maBinhLuan = req.params.maBinhLuan;
  try {
    const communityPost = await CommunityPost.findOne({ MaBaiDang: maBaiDang });
    if (!communityPost) {
      return res.status(400).json({ message: "Bài đăng không tồn tại!" });
    }

    const comment = communityPost.BinhLuan.find(c => c.MaBinhLuan === maBinhLuan);
    if (!comment) {
      return res.status(400).json({ message: "Bình luận không tồn tại!" });
    }

    // Thu thập tất cả MaBinhLuan cần xóa (bình luận gốc và trả lời liên quan)
    const commentsToDelete = new Set([maBinhLuan]);
    const collectReplies = (commentId) => {
      const replies = communityPost.BinhLuan.filter(c => c.TraLoiCho === commentId);
      replies.forEach(reply => {
        commentsToDelete.add(reply.MaBinhLuan);
        collectReplies(reply.MaBinhLuan); // Đệ quy để lấy trả lời của trả lời
      });
    };
    collectReplies(maBinhLuan);

    // Xóa tất cả bình luận/trả lời trong commentsToDelete
    communityPost.BinhLuan = communityPost.BinhLuan.filter(
      c => !commentsToDelete.has(c.MaBinhLuan)
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

exports.getTopCommunityPost = async (req, res) => {
  try {
    const topCommunityPost = await CommunityPost.aggregate([
      {
        $addFields: {
          commentCount: { $size: "$BinhLuan" } // Tính số lượng bình luận
        }
      },
      {
        $sort: { commentCount: -1 } // Sắp xếp theo số bình luận giảm dần
      },
      {
        $limit: 3 // Lấy 3 bài đăng top
      }
    ]);

    const customerIds = [...new Set(topCommunityPost.map(post => post.MaKhachHang))];
    const customers = await Customer.find({ MaKhachHang: { $in: customerIds } });
    const customerMap = {};
    customers.forEach(customer => {
      customerMap[customer.MaKhachHang] = {
        TenKhachHang: customer.TenKhachHang,
        HinhAnhKhachHang: customer.Image
      };
    });

    const result = topCommunityPost.map(post => ({
      ...post,
      TenKhachHang: customerMap[post.MaKhachHang]?.TenKhachHang || "Không xác định",
      HinhAnhKhachHang: customerMap[post.MaKhachHang]?.HinhAnhKhachHang || null
    }));

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi lấy bài đăng có nhiều bình luận nhất", error: error.message });
  }
}

exports.report = async (req, res) => {
  const { MaKhachHang, LyDoBaoCao } = req.body;
  try {
    const communitypost = await CommunityPost.findOne({ MaBaiDang: req.params.maBaiDang });
    if (!communitypost) {
      return res.status(400).json({ message: "Bài đăng không tồn tại!" });
    }

    if (communitypost.IdKhachHangDaBaoCao?.includes(MaKhachHang)) {
      return res.status(400).json({ message: "Bạn đã báo cáo bài đăng này rồi." });
    }

    communitypost.IdKhachHangDaBaoCao = [...(communitypost.IdKhachHangDaBaoCao || []), MaKhachHang];
    // Sử dụng Set để tự động loại bỏ trùng lặp
    const uniqueReasons = [...new Set([...(communitypost.LyDoBaoCao || []), LyDoBaoCao])];
    communitypost.LyDoBaoCao = uniqueReasons;
    
    await communitypost.save();
    return res.status(200).json({ message: "Báo cáo bài đăng thành công!" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi báo cáo", error: error.message });
  }
}

exports.hiddenPost = async (req, res) => {
  const { TrangThai } = req.body;
  try {
    const communitypost = await CommunityPost.findOne({ MaBaiDang: req.params.maBaiDang });
    if (!communitypost) {
      return res.status(400).json({ message: "Bài đăng không tồn tại." });
    }
    communitypost.TrangThaiDang = TrangThai;
    await communitypost.save();
    return res.status(200).json({ message: "Ẩn bài đăng thành công." });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi ẩn bài", error: error.message });
  }
}

exports.upload = upload.array('HinhAnh', 4);