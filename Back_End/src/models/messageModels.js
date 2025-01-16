const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    MaTinNhan: { type: String, required: true },
    MaCuocTroChuyen: { type: String, required: true },
    NguoiGui: { type: String, required: true },
    NoiDung: { type: String, required: true },
    ThoiGian: { type: Date, default: Date.now },
});

function generateMaTinNhan() {
    return 'MS' + Math.floor(10000 + Math.random() * 90000);
}

messageSchema.pre("save", async function (next) {
    try {
        if (!this.MaTinNhan) {
            this.MaTinNhan = generateMaTinNhan();
        }
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Message', messageSchema);
