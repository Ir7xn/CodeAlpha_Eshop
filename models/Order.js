const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true
}
,
  items: [
    {
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },

  address: {
  type: String,
  required: true
}

});

module.exports = mongoose.model('Order', orderSchema);
