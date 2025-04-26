const User = require('../models/User');
const bcrypt = require('bcrypt');

class AccountsController {
    // GET /accounts/login
    loginPage(req, res) {
        res.render('accounts/login');
    }

    // POST /accounts/login
    async login(req, res) {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.send('Sai tên đăng nhập');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.send('Sai mật khẩu');

        req.session.user = {
            _id: user._id,
            username: user.username,
            role: user.role
        };

        res.redirect('/');
    }

    // GET /accounts/register
    registerPage(req, res) {
        res.render('accounts/register');
    }

    // POST /accounts/register
    async register(req, res) {
        console.log("Form gửi lên:", req.body); // <-- thêm dòng này
        const { username, password,confirmPassword  } = req.body;

        // check password
        if (password !== confirmPassword) {
            return res.send("Mật khẩu không khớp");
        }

        const existing = await User.findOne({ username });

        if (existing) return res.send('Tên đăng nhập đã tồn tại');

        const hash = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hash });
        await user.save();

        console.log("Đã lưu user:", user); // <-- thêm dòng này

        req.session.user = {
            _id: user._id,
            username: user.username,
            role: user.role
        };

        res.redirect('/');
    }

    // GET /accounts/logout
    logout(req, res) {
        req.session.destroy(() => {
            res.redirect('/accounts/login');
        });
    }
}

module.exports = new AccountsController;