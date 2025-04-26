const product = require('../models/Product');//import model 

class SiteController {
    //[GET] /(home)

    home(req, res){
        res.render('home');
        
    }

}
module.exports = new SiteController;    