const Product = require('../models/Product');
const product = require('../models/Product');//import model 
class CollectionsController {

    //[GET]  /collections
    show(req,res){
        res.render('collections');
    }

    //[GET]  /collections/all
    async showProductAll(req, res){
            // res.render('home');
            try {
                const products = await product.find({});// await chờ Course.find({}) gửi yêu cầu sang model
                //console.log(" Kết quả truy vấn MongoDB:", products); // Log kết quả
                //  hoàn thành trước khi gán kết quả vào courses
                //res.json(products);
                res.render('collections',{//lấy được dữ liệu mạng về controller truyền sang viewview
                    products : products
                    
                });
            } catch (error) {
                console.error("Lỗi truy vấn database:", err);
                res.status(400).json({error: 'ERROR!!!'});//json là truyền đối tượng 
            }
    }


    //[GET]  /collections/bottoms
    async showProductBottoms(req, res){
        // res.render('home');
        try {
            const products = await product.find({ category: "bottom" });// await chờ Course.find({}) gửi yêu cầu sang model
            //console.log(" Kết quả truy vấn MongoDB:", products); // Log kết quả
            //  hoàn thành trước khi gán kết quả vào courses
            //res.json(products);
            res.render('collections',{//lấy được dữ liệu mạng về controller truyền sang viewview
                products : products
                
            });
        } catch (error) {
            console.error("Lỗi truy vấn database:", err);
            res.status(400).json({error: 'ERROR!!!'});//json là truyền đối tượng 
        }
    }
    
    async showProductTops(req, res){
        // res.render('home');
        try {
            const products = await product.find({ category: "top" });// await chờ Course.find({}) gửi yêu cầu sang model 
            res.render('collections',{//lấy được dữ liệu mạng về controller truyền sang viewview
                products : products
                
            });
        } catch (error) {
            console.error("Lỗi truy vấn database:", err);
            res.status(400).json({error: 'ERROR!!!'});//json là truyền đối tượng 
        }

    }

    //[GET]  /collections/outerwear
    async showProductOuterwear(req, res){
        try {
            const products = await product.find({ category: "outerwear" });// await chờ Course.find({}) gửi yêu cầu sang model 
            res.render('collections',{//lấy được dữ liệu mạng về controller truyền sang viewview
                products : products
                
            });
        } catch (error) {
            console.error("Lỗi truy vấn database:", err);
            res.status(400).json({error: 'ERROR!!!'});//json là truyền đối tượng 
        }

    }
    
    //[GET]  /collections/create
    create(req,res){
        res.render('create');
    }

    //[POST]  /collections/store
    store(req,res){
        //res.json(req.body);   
        const Product = new product(req.body);
        Product.save()
            .then(() => res.redirect('/me/stored/products'))
            .catch(error => {
                console.error("Lỗi lưu vào database:", error);
                res.status(400).json({error: 'ERROR!!!'});
            });
    }

    //[GET]  /collections/:id/edit
    async edit(req,res){
        try {
            const productEdit = await product.findById(req.params.id);
            res.render('edit',{
                product: productEdit
            });
        } catch (error) {
            console.error("Lỗi truy vấn database:", err);
            res.status(400).json({error: 'ERROR!!!'});//json là truyền đối tượng 
        }
    }

    //[PUT]  /collections/:id/update
    async update(req,res){
        try {
            const productUpdate = await product.findOneAndUpdate({_id: req.params.id},req.body);
            res.redirect('/me/stored/products');
        } catch (error) {
            console.error("Lỗi truy vấn database:", err);
            res.status(400).json({error: 'ERROR!!!'});//json là truyền đối tượng 
        }
    }

    //[DELETE]  /collections/:id/delete
    async delete(req,res){
        product.delete({_id: req.params.id})
            .then(() => res.redirect('back'))
            .catch(error => {
                console.error("Lỗi xóa sản phẩm:", error);
                res.status(400).json({error: 'ERROR!!!'});
            });
    }

    //[PATCH]  /collections/:id/restore
    async restore(req, res) {
        product.restore({ _id: req.params.id })
            .then(() => {
                // Sau khi restore xong, set lại deleted = false thủ công
                return product.updateOne({ _id: req.params.id }, { deleted: false });
            })
            .then(() => res.redirect('back')) // Chuyển hướng sau khi update thành công
            .catch(error => {
                console.error("Lỗi khôi phục sản phẩm:", error);
                res.status(400).json({ error: 'ERROR!!!' });
            });
    }
//     .restore() chỉ xóa deletedAt, KHÔNG set lại deleted: false

// updateOne({ deleted: false }) là bước fix tay

// .then() tiếp theo dùng để redirect khi thành công
        
    
    //[DELETE]  /collections/:id/force
    async forceDelete(req,res){
        product.deleteOne({_id: req.params.id})
            .then(() => res.redirect('back'))
            .catch(error => {
                console.error("Lỗi xóa cứng sản phẩm:", error);
                res.status(400).json({error: 'ERROR!!!'});
            });
    }
}

module.exports = new CollectionsController;//tạo đối tương của thg này và export ra ngoài file khac khác muốn dùng thì require vào