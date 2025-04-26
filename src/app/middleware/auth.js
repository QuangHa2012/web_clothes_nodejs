const User = require('../models/User');

module.exports = {
    isLoggedIn: async (req, res, next) => {
        if (req.session.user) {
            try {
                const user = await User.findById(req.session.user._id);
                if (!user) return res.redirect('/accounts/login');
                req.user = user; // Gán user từ DB vào req
                next();
            } catch (err) {
                next(err);
            }
        } else {
            res.redirect('/accounts/login');
        }
    },

    isAdmin: (req, res, next) => {
        if (req.session.user && req.session.user.role === 'admin') {
            return next();
        }
        res.send('Bạn không có quyền truy cập trang này!');
    }
};

