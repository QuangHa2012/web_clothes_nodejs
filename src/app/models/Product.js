const mongoose = require('mongoose');
//const slug = require('mongoose-slug-generator');
const slug = require('mongoose-slug-updater');//
const  mongooseDelete = require('mongoose-delete');
//const slugify = require('slugify');
const Schema = mongoose.Schema;

const Product = new Schema({
    name: { type: String,required: true },
    sku: { type: String, },
    price:{type: mongoose.Types.Decimal128, require:true},
    img: { type: String,  },
    images: [String], // danh sách ảnh phụ
    stock:{ type: Number,  },
    category:{ type: String, },
    slug: {
        type: String,
        slug: 'name',        // Tạo slug từ trường "name"
        unique: true,        // Đảm bảo slug không bị trùng
        slugPaddingSize: 4   // Nếu trùng, thêm số phía sau: ao-thun-0001
    },
    //deleted: { type: Boolean, default: false },
    des: { type: String, },
    buff: Buffer
},
{
    timestamps: true,
});

//add plugin to mongoose
mongoose.plugin(slug); // Cài đặt slug cho mongoose

Product.plugin(mongooseDelete,{overrideMethods: 'all', deletedAt: true});//cài đặt xóa mềm cho model này, có thể xóa cứng hay mềm tùy ý
module.exports = mongoose.model('Product', Product, 'products');

/**
 * 
 *  Mongoose sẽ tự đổi Product thành products, nhưng dữ liệu đang nằm trong src_web.products
👉 Giải pháp: Chỉ rõ collection bằng cách sửa lại model như sau:
 * 
 */