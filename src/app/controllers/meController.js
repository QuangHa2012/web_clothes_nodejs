const product = require('../models/Product');//import model 

class MeController {
    // [GET] /me/stored/products
    storedProducts(req, res, next) {
        product.find({})//find all products that are not deleted
            .then(products => {
                res.render('me/stored-products', {
                    products: products
                });
            })
            .catch(next);
        //res.render('me/stored-products');
    }
    // [GET] /me/trash/products
    trashProducts(req, res) {
        product.findDeleted({ deleted: true })//find all products that are deleted
            .then(products => {
                res.render('me/trash-products', {
                    products: products
                });
            })
            .catch(err => {
                console.error("Lỗi truy vấn database:", err);
                res.status(400).json({ error: 'ERROR!!!' });//json là truyền đối tượng 
            });
        //res.render('me/trash-products');
    }
}

module.exports = new MeController;