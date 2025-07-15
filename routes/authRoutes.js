const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const passport = require('passport');
const isAdmin = require('../middleware/isAdmin');
const path = require('path');

const otpStore = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'One Time Password',
      html: `<p>Your Ecommerce Website Login OTP is <b>${otp}</b></p>`
    });
    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] && otpStore[email] == otp) {
    delete otpStore[email];
    return res.status(200).json({ verified: true });
  }
  return res.status(400).json({ message: "Invalid or expired OTP" });
});

router.post('/register', async (req, res) => {
  const { name, email, password, dob } = req.body;
  const age = calculateAge(new Date(dob));
  if (age < 18) return res.status(400).json({ message: 'Must be 18 or older to register.' });

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword, dob });
  await user.save();

  res.status(201).json({ message: 'User registered successfully' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // ✅ Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET, // make sure this exists in your .env
      { expiresIn: '7d' }
    );

    res.status(200).json({
  token,
  role: user.role,
  name: user.name,
  redirectTo: user.role === 'admin' ? '/admin/dashboard.html' : '/'
});

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


router.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

router.get('/admin/dashboard', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/dashboard.html'));
});

function calculateAge(dob) {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

router.get('/all', isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

router.get('/count', isAdmin, async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;