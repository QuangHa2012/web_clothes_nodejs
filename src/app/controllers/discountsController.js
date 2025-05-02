const product = require('../models/Product');//import model 
const Order = require('../models/Order');//import model
const user = require('../models/User');//import model
const DiscountCode = require('../models/Discount');//import model
const crypto = require('crypto'); 
const axios = require('axios');

class DiscountsController {

    // [PoST] /discounts/apply
    async applyDiscount(req, res, next) {
        const { discountCode } = req.body;  // Lấy mã giảm giá người dùng nhập
    
        // Kiểm tra xem discountCode có tồn tại không
        if (!discountCode || typeof discountCode !== 'string' || discountCode.trim() === '') {
            return res.status(400).send('Mã giảm giá không hợp lệ.');
        }
    
        try {
            // Tìm mã giảm giá trong cơ sở dữ liệu
            const discount = await DiscountCode.findOne({ 
                code: discountCode.toUpperCase().trim(),  // Tìm mã giảm giá, chuyển thành chữ hoa
                isActive: true, // Kiểm tra mã giảm giá có còn hiệu lực
                expiryDate: { $gte: new Date() } // Kiểm tra mã giảm giá chưa hết hạn
            });
    
            // Nếu không tìm thấy mã giảm giá hoặc mã giảm giá không hợp lệ
            if (!discount) {
                return res.status(404).send('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
            }
    
            // Nếu tìm thấy mã giảm giá hợp lệ, lưu mã vào session (hoặc các cơ chế khác)
            req.session.discount = {
                code: discount.code,
                percent: discount.discountPercent
            };
    
            res.send('Mã giảm giá đã được áp dụng!');
        } catch (err) {
            console.error('Lỗi khi áp dụng mã giảm giá:', err);
            res.status(500).send('Lỗi khi áp dụng mã giảm giá.');
        }
    }
  

}

module.exports = new DiscountsController;