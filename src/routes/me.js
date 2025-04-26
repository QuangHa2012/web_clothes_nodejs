const express = require('express');
const router = express.Router();//khởi tạo router 
const meController = require('../app/controllers/meController');//nạp controller vào
const { isLoggedIn, isAdmin } = require('../app/middleware/auth');//nạp middleware vào



router.get('/stored/products',isLoggedIn, isAdmin, meController.storedProducts);
router.get('/trash/products',isLoggedIn, isAdmin, meController.trashProducts);






module.exports = router;