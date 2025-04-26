const path = require('path');//có sẵn 
const express = require('express');//inport 
const methodOverride = require('method-override');
const handlebars = require('express-handlebars');
const session = require('express-session');//import express-session
const MongoStore = require('connect-mongo');//import connect-mongo
const cookieParser = require('cookie-parser');
const User = require('./app/models/User');//import model user


const app = express();//khởi tạo
const port = 3000;//tạo cổng 


const route = require('./routes/index');//import route()

//import db 
const db = require('./config/db');

//connect db 
db.connect();//{connect}


//static
app.use(express.static(path.join(__dirname,'public')));//path trang chủ tương ứng với thư mục public 

//cookie để lưu trữ thông tin người dùng
app.use(cookieParser());//import cookie-parser



app.use(express.json());
app.use(express.urlencoded({ extended: true }));//xử lý dữ liệu từ form gửi lên

// SESSION + connect-mongo
app.use(session({
    secret: 'secret-key', // chuỗi có thể đổi để mã hóa session
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: 'mongodb://127.0.0.1:27017/src_web',
        collectionName: 'sessions'
    }),
    cookie: { maxAge: 1000 * 60 * 60 } // session sống 1 giờ
}));//khởi tạo session, lưu vào mongoDB, thời gian sống 1 giờ

// Gắn session vào res.locals để dùng trong views
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.session.user || null; // 👈 Gắn user vào views
    next();
});


// Middleware để truy xuất giỏ hàng của người dùng và lưu vào res.locals
app.use(async (req, res, next) => {
    if (req.session.user) {
        try {
            const user = await User.findById(req.session.user._id).populate('cart.product');
            const cart = user.cart || []; // 🔧 khai báo biến cart
            res.locals.cart = user.cart || [];

            // Tính tổng số lượng sản phẩm trong giỏ
            const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

            res.locals.cart = cart;
            res.locals.cartItemCount = totalQuantity; // Số lượng để hiển thị
        } catch (err) {
            console.error("Lỗi khi truy xuất giỏ hàng: ", err);
        }
    }
    else {
        res.locals.cartItemCount = 0;
    }
    
    next();
});

// override with POST having ?_method=PUT
app.use(methodOverride('_method'));//gọi method-override





//template engine 
app.engine('.hbs', handlebars.engine(
    {
        extname: '.hbs',
        runtimeOptions: {

            allowProtoPropertiesByDefault: true,
            
            allowProtoMethodsByDefault: true
            
        },
        helpers: {
            formatPrice: function () {
                if (this.price === undefined || this.price === null) {
                    return "Chưa có giá";
                }
        
                // Kiểm tra nếu price là Decimal128 và chuyển đổi thành Number
                if (this.price._bsontype === 'Decimal128') {
                    this.price = parseFloat(this.price.toString()); // Chuyển Decimal128 thành Number
                }
        
                // Đảm bảo là Number, rồi hiển thị với định dạng Việt Nam
                return Number(this.price).toLocaleString("vi-VN") + "đ";
            },
            sum :  (a,b) => a+b,// override
            eq: (a, b) => a === b,// so sánh 2 biến a và b
            formatPriceCart: function () {
                if (this.product.price === undefined || this.product.price === null) {
                    return "Chưa có giá";
                }
        
                // Kiểm tra nếu price là Decimal128 và chuyển đổi thành Number
                if (this.product.price._bsontype === 'Decimal128') {
                    this.product.price = parseFloat(this.product.price.toString()); // Chuyển Decimal128 thành Number
                }
        
                // Đảm bảo là Number, rồi hiển thị với định dạng Việt Nam
                return Number(this.product.price).toLocaleString("vi-VN") + "đ";
            },
            ifIndexZero: function(index, options) {
                return index === 0 ? 'active' : '';
            },
            multiply: (a, b) => a * b,
            calculateTotal: function(cart) {
                let total = 0;
                cart.forEach(item => {
                    total += item.product.price * item.quantity;
                });
                return total;
            },
        }
    },

    
)); // thêm  handlebars.




app.set('view engine', 'hbs');
app.set('views', path.join(__dirname,'resources','views'));//__dirname fix path folder


//init routes
route(app);


app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);//template string 
})
