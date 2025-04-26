const express = require('express');
const router = express.Router();//khởi tạo router 
const collectionsController = require('../app/controllers/collectionsController.js');//nạp controller vào 
const { isLoggedIn, isAdmin } = require('../app/middleware/auth');//nạp middleware vào



router.get('/all',collectionsController.showProductAll);


router.get('/create',isLoggedIn, isAdmin,collectionsController.create);
router.post('/store',isLoggedIn, isAdmin,collectionsController.store);
router.get('/:id/edit',isLoggedIn, isAdmin,collectionsController.edit);//lấy id sản phẩm để sửa
router.put('/:id',isLoggedIn, isAdmin,collectionsController.update);//cập nhật sản phẩm
router.delete('/:id',isLoggedIn, isAdmin,collectionsController.delete);//xóa sản phẩm
router.patch('/:id/restore',isLoggedIn, isAdmin,collectionsController.restore);//khôi phục sản phẩm đã xóa mềm
router.delete('/:id/force',isLoggedIn, isAdmin,collectionsController.forceDelete);//xóa cứng sản phẩm đã xóa mềm


router.get('/bottoms',collectionsController.showProductBottoms);
router.get('/tops',collectionsController.showProductTops);
router.get('/outerwear',collectionsController.showProductOuterwear);
router.get('/',collectionsController.show);






module.exports = router;