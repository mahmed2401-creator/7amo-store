const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    // حقول إضافية للعرض في الصفحة الرئيسية
    oldPrice: {
      type: Number,
      default: null,
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    reviews: {
      type: Number,
      required: true,
      default: 0,
    },
    badge: {
      type: String,
      enum: ['sale', 'new', 'low', ''],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
