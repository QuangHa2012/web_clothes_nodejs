const User = require('../models/User');
const Product = require('../models/Product');

class CartsController {

    show(req, res, next) {
        const user = req.user;
    
        // Kiểm tra xem người dùng có đăng nhập và có giỏ hàng không
        if (!user || !user.cart || user.cart.length === 0) {
            return res.redirect('/accounts/login');
        }
    
        // Lấy danh sách ID sản phẩm từ giỏ hàng
        const productIds = user.cart.map(item => item.product);
    
        // Tìm tất cả các sản phẩm trong cơ sở dữ liệu với ID trong giỏ hàng
        Product.find({ _id: { $in: productIds } })
            .then(products => {
                // Tạo danh sách các sản phẩm trong giỏ hàng với thông tin sản phẩm và số lượng
                const cartItems = user.cart.map(item => {
                    const product = products.find(p => p._id.toString() === item.product.toString());
                    return {
                        product: product || null, // Nếu không tìm thấy sản phẩm, trả về null
                        quantity: item.quantity
                    };
                });
    
                // Render trang giỏ hàng với dữ liệu người dùng và các sản phẩm trong giỏ hàng
                res.render('carts', {
                    cart: cartItems,
                    user
                });
            })
            .catch(err => {
                // Xử lý lỗi nếu có
                console.error(err);
                next(err);
            });
    }
    
    
    
    

    async addToCart(req, res, next) {
        try {
            const productId = req.params.id;
            const userId = req.session.user._id;
    
            // Lấy thông tin người dùng từ cơ sở dữ liệu
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).send("Không tìm thấy người dùng.");
            }
    
            // Kiểm tra nếu sản phẩm đã có trong giỏ hàng của người dùng
            const existingItem = user.cart.find(item => item.product.toString() === productId);
    
            // Nếu sản phẩm đã có trong giỏ, tăng số lượng
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                // Nếu sản phẩm chưa có, thêm sản phẩm vào giỏ hàng
                user.cart.push({ product: productId, quantity: 1 });
            }
    
            // Lưu lại giỏ hàng trong cơ sở dữ liệu
            await user.save();
    
            // Redirect về trang giỏ hàng hoặc trang hiện tại
            res.redirect('back');
        } catch (err) {
            next(err);
        }
    }
    

    // GET /carts/remove/:id
    async removeFromCart(req, res, next) {
        try {
            const productId = req.params.id;
            const userId = req.session.user._id;
    
            // Lấy thông tin người dùng từ cơ sở dữ liệu
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).send("Không tìm thấy người dùng.");
            }
    
            // Kiểm tra nếu sản phẩm có trong giỏ hàng của người dùng
            const itemIndex = user.cart.findIndex(item => item.product.toString() === productId);
            if (itemIndex === -1) {
                return res.status(404).send("Sản phẩm không có trong giỏ hàng.");
            }
    
            // Xóa sản phẩm khỏi giỏ hàng
            user.cart.splice(itemIndex, 1);
    
            // Lưu lại giỏ hàng trong cơ sở dữ liệu
            await user.save();
    
            // Redirect về trang giỏ hàng
            res.redirect('back');
        } catch (err) {
            next(err);
        }
    }
    
    


}

module.exports = new CartsController;