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
            return res.redirect('/cart');
        }
    
        const productIds = user.cart.map(item => item.product);
    
        product.find({ _id: { $in: productIds } })
            .then(products => {
                const cartItems = user.cart.map(item => {
                    const productData = products.find(p => p._id.toString() === item.product.toString());
    
                    return {
                        product: productData || {},
                        quantity: item.quantity
                    };
                });
    
                let totalPrice = cartItems.reduce((sum, item) => {
                    const price = item.product?.price || 0;
                    return sum + (price * item.quantity);
                }, 0);
    
                // Áp dụng mã giảm giá nếu có
                let discount = req.session.discount;
                let discountAmount = 0;
    
                if (discount && discount.percent) {
                    // Tính số tiền giảm giá
                    discountAmount = (totalPrice * discount.percent) / 100;
                    // Trừ đi số tiền giảm giá vào tổng tiền
                    totalPrice -= discountAmount;
                }
    
                // Render lại checkout page với tổng tiền đã cập nhật
                res.render('checkout', {
                    cart: cartItems,
                    user,
                    totalPrice,
                    discount: discount ? `${discount.percent}%` : null,
                    discountAmount
                });
            })
            .catch(next);
    }
    
    
    
    
    
    // [POST] /orders/create_payment_momo
    async createPaymentMomo(req, res, next) {
        try {
            const user = req.user;
    
            if (!user || !user.cart || user.cart.length === 0) {
                return res.redirect('/cart');
            }
    
            const productIds = user.cart.map(item => item.product);
            const productsData = await product.find({ _id: { $in: productIds } });
    
            const items = user.cart.map(item => {
                return {
                    productId: item.product,
                    quantity: item.quantity
                };
            });
    
            const totalPrice = user.cart.reduce((sum, item) => {
                const prod = productsData.find(p => p._id.toString() === item.product.toString());
                return sum + (prod?.price || 0) * item.quantity;
            }, 0);
    
            // Tạo đơn hàng trong MongoDB
            const newOrder = new Order({
                userId: user._id,
                items,
                totalPrice,
                status: 'unpaid'
            });
    
            await newOrder.save();
    
            // Dữ liệu MoMo
            const partnerCode = 'MOMO';
            const accessKey = 'F8BBA842ECF85';
            const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    
            const requestId = partnerCode + Date.now();
            const orderId = `${newOrder._id}-${Date.now()}`;  // Đảm bảo duy nhất
            const orderInfo = 'Thanh toán đơn hàng qua MoMo';
            const redirectUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
            const ipnUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
            const requestType = 'captureWallet';
            const extraData = '';
    
            // Tạo chữ ký
            const rawSignature = `accessKey=${accessKey}&amount=${totalPrice}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
            const signature = crypto.createHmac('sha256', secretKey)
                .update(rawSignature)
                .digest('hex');
    
            const requestBody = {
                partnerCode,
                accessKey,
                requestId,
                amount: totalPrice.toString(),
                orderId,
                orderInfo,
                redirectUrl,
                ipnUrl,
                extraData,
                requestType,
                signature,
                lang: 'vi'
            };
    
            // Gửi yêu cầu tới MoMo
            const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            const payUrl = response.data.payUrl;
            return res.redirect(payUrl);
    
        } catch (err) {
            console.error('Lỗi thanh toán MoMo:', err);
            return res.status(500).send('Lỗi tạo thanh toán MOMO');
        }
    }
    // [GET] /orders/momo-success
    async momoSuccess(req, res) {
        const { orderId, resultCode } = req.query;
        if (resultCode === '0') {
            await Order.findByIdAndUpdate(orderId, { status: 'paid' });
            res.send('✅ Thanh toán thành công!');
        } else {
            await Order.findByIdAndUpdate(orderId, { status: 'cancelled' });
            res.send('❌ Thanh toán thất bại hoặc bị hủy.');
        }
    }

  

}

module.exports = new OdersController;