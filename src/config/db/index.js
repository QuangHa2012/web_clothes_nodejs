const mongoose = require('mongoose');

async function connect() {
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/src_web');
        console.log('connect successfully');
    }
    catch(error) {
        console.log('connect failure')
        
    }

}

module.exports = {connect};//export object để khi import thì biến db là object đó và gọi lại db.connect