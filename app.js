require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const bcrypt = require('bcrypt');

const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
require('./config/passport');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5000', credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: false,
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// API Routes (protected as needed)
app.use('/api/products', productRoutes);
app.use('/api/users', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/auth', require('./routes/googleRoutes'));

// Public static files
app.use('/uploads', express.static('uploads'));
app.use('/', express.static(path.join(__dirname, 'public')));

// ✅ Remove unnecessary session-based frontend protection
// Protect APIs using JWT middleware only in routes

// Auto Admin Setup
async function createAdmin() {
  const existingAdmin = await User.findOne({ email: 'admin@example.com' });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('✅ Admin created');
  }
}

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await createAdmin();
  })
  .catch(err => console.error("❌ MongoDB error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
