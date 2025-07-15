const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false // optional for Google-auth users
  },
  googleId: {
    type: String
  },
role: {
  type: String,
  enum: ['customer', 'admin'],
  default: 'customer'
}
,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
