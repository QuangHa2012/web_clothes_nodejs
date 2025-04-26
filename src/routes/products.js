const express = require('express');
const router = express.Router();//khởi tạo router 
const productsController = require('../app/controllers/productsController');//nạp controller vào 



router.get('/:slug', productsController.showDetail);//truyền slug vào để tìm kiếm sản phẩm theo slug
//router.get('/', productsController.index);//truyền slug vào để tìm kiếm sản phẩm theo slug




module.exports = router;