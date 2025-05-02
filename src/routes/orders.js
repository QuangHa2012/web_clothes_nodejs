const express = require('express');
const router = express.Router();//khởi tạo router 
const odersController = require('../app/controllers/ordersController');//nạp controller vào 
const { isLoggedIn } = require('../app/middleware/auth');//nạp middleware vào







router.post('/buy-now',isLoggedIn, odersController.buynow);//bấm mua ngay ko qua giỏ hàng 
router.get('/momo-success',isLoggedIn, odersController.momoSuccess);
router.post('/update-cart', isLoggedIn, odersController.updateCart); // Cập nhật giỏ hàng khi bấm mua ngay
router.post('/create_payment_momo', isLoggedIn, odersController.createPaymentMomo);// thanh toán momo
router.get('/check-out',isLoggedIn, odersController.checkout);




module.exports = router;