const product = require('../models/Product');//import model 
const Order = require('../models/Order');//import model
const user = require('../models/User');//import model
const crypto = require('crypto'); 
const axios = require('axios');

class OdersController {

    // [GET] /orders
    async  buynow(req, res, next) {
        try {
            const { productId, quantity } = req.body; // Lấy thông tin từ form
            
            // Tìm sản phẩm trong database
            const foundProduct = await product.findById(productId);
            if (!foundProduct) {
                return res.status(404).send('Không tìm thấy sản phẩm');
            }
    
            // Tạo giỏ hàng tạm chứa sản phẩm
            const cart = [{
                product: foundProduct,
                quantity: parseInt(quantity), // Chuyển quantity sang số nguyên
            }];
    
            // Tính tổng giá trị giỏ hàng
            const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    
            // Render trang checkout với giỏ hàng và tổng giá trị
            res.render('checkout', { cart, totalPrice });
    
        } catch (error) {
            next(error);  // Xử lý lỗi
        }
    }

    // / [POST] /orders/update-cart
    async  updateCart(req, res, next) {
        try {
            // Lấy số lượng từ form
            const quantity = req.body.quantity; // quantity là một object chứa productId và số lượng
    
            // Lặp qua giỏ hàng và cập nhật số lượng của từng sản phẩm
            req.session.cart.forEach(item => {
                const updatedQuantity = quantity[item.product._id];
                if (updatedQuantity) {
                    item.quantity = parseInt(updatedQuantity);
                }
            });
    
            // Tính toán lại tổng tiền
            const totalPrice = req.session.cart.reduce((sum, item) => {
                return sum + item.product.price * item.quantity;
            }, 0);
    
            // Cập nhật lại tổng tiền vào session
            req.session.totalPrice = totalPrice;
    
            // Chuyển hướng đến trang checkout
            res.redirect('/checkout');
        } catch (error) {
            next(error); // Xử lý lỗi
        }
    }

    /// [GET] /orders/check-out
    checkout(req, res, next) {
        const user = req.user;
    
        if (!user || !user.cart || user.cart.length === 0) {
            return res.redirect('/cart'); // Nếu giỏ hàng trống, quay lại giỏ hàng
        }
    
        const productIds = user.cart.map(item => item.product);
    
        product.find({ _id: { $in: productIds } })
            .then(products => {
                const cartItems = user.cart.map(item => {
                    // Tìm sản phẩm từ danh sách đã lấy
                    const productData = products.find(p => p._id.toString() === item.product.toString());
                    
                    return {
                        product: productData || {},  // Nếu không tìm thấy sản phẩm, trả về đối tượng trống
                        quantity: item.quantity
                    };
                });
    
                // Tính tổng tiền của giỏ hàng
                const totalPrice = cartItems.reduce((sum, item) => {
                    const price = item.product?.price || 0; // Kiểm tra giá sản phẩm
                    return sum + (price * item.quantity);
                }, 0);
    
                // Truyền dữ liệu vào view
                res.render('checkout', {
                    cart: cartItems,
                    user,
                    totalPrice
                });
            })
            .catch(next);
    }
    
    
    // [POST] /orders/create_payment_momo
    async  createPaymentMomo(req, res, next) {
        const { amount } = req.body;
    
        const partnerCode = 'MOMO';
        const accessKey = 'F8BBA842ECF85';
        const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
        const requestId = partnerCode + new Date().getTime();
        const orderId = requestId;
        const orderInfo = 'Thanh toán qua MoMo';
        const redirectUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
        const ipnUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
        const requestType = 'captureWallet';
        const extraData = ''; // Nếu không có thì để trống
    
        // B1: Tạo chữ ký
        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto.createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');
    
        // B2: Tạo body gửi đi  
        const requestBody = {
            partnerCode,
            accessKey,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            requestType,
            signature,
            lang: 'vi'
        };
    
        try {
            const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            const payUrl = response.data.payUrl;
            return res.redirect(payUrl); // chuyển người dùng sang trang thanh toán MOMO
        } catch (err) {
            console.error('Lỗi tạo thanh toán MoMo:', err);
            return res.status(500).send('Lỗi tạo thanh toán MOMO');
        }
    }

  

}

module.exports = new OdersController;