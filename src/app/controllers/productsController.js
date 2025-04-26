const product = require('../models/Product');//import model 

class ProductsController {

  // [GET] /products/:slug
  showDetail(req, res, next) {
    product.findOne({ slug: req.params.slug })//tìm kiếm theo slug
      .then((product) => {
        res.render('productDetail', { product: product.toObject() });//trả về view show và truyền dữ liệu vào 
      })
      .catch(next);
  }


  

}

module.exports = new ProductsController;