const express = require('express');
const router = express.Router();//khởi tạo router 
const discountController = require('../app/controllers/discountsController');//nạp controller vào 
const { isLoggedIn } = require('../app/middleware/auth');//nạp middleware vào



router.post('/apply-discount', isLoggedIn, discountController.applyDiscount);// áp dụng mã giảm giá








module.exports = router;