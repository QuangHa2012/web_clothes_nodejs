const express = require('express');
const router = express.Router();//khởi tạo router 
const accountsController = require('../app/controllers/accountsController');//nạp controller vào 



router.get('/login', accountsController.loginPage);
router.post('/login', accountsController.login);

router.get('/register', accountsController.registerPage);
router.post('/register', accountsController.register);

router.get('/logout', accountsController.logout);



module.exports = router;