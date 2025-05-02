const collectionsRouter = require('./collections');// route của cái nào cx phải nạp vào file này 
const accountsRouter = require('./accounts');
const siteRouter = require('./site');
const meRouter = require('./me');
const productsRouter = require('./products');// import route của từng cái vào
const cartRoutes = require('./carts');// import route của từng cái vào
const ordersRouter = require('./orders');// import route của từng cái vào
const discountsRouter = require('./discounts');// import route của từng cái vào

function route(app) {
    
    app.use('/me',meRouter);// nạp route me (tuyến đường,router cấp nhỏ hơn)
    app.use('/discounts', discountsRouter);// nạp route giảm giá (tuyến đường,router cấp nhỏ hơn)
    app.use('/orders', ordersRouter); // nạp route đơn hàng (tuyến đường,router cấp nhỏ hơn)
    app.use('/carts', cartRoutes); // nạp route giỏ hàng (tuyến đường,router cấp nhỏ hơn)
    app.use('/collections',collectionsRouter);// nạp route collections  (tuyến đường,router cấp nhỏ hơn)
    app.use('/products',productsRouter);// nạp route products  (tuyến đường,router cấp nhỏ hơn)
    app.use('/accounts',accountsRouter);
    app.use('/',siteRouter);
    
    
    
   
}


module.exports = route;//export functions route()