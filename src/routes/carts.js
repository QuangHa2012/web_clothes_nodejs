const express = require('express');
const router = express.Router();//khởi tạo router 
const cartsController = require('../app/controllers/cartsController');//nạp controller vào 
const { isLoggedIn } = require('../app/middleware/auth');//nạp middleware vào





router.post('/add/:id', isLoggedIn, cartsController.addToCart);
router.get('/remove/:id', isLoggedIn, cartsController.removeFromCart);
router.get('/',isLoggedIn, cartsController.show);




module.exports = router;