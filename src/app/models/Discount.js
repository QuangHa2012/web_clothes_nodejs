const mongoose = require("mongoose");

const discountCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountPercent: { type: Number, required: true }, // Ví dụ: 10% = 10
  expiryDate: { type: Date },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('DiscountCode', discountCodeSchema);
