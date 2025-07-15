const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: String,
  price: {
    type: Number,
    required: true,
  },
  description: String,
  category: String,
  inStock: {
    type: Number, default: 0,
  }
});

module.exports = mongoose.model('Product', productSchema);
