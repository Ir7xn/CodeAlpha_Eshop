const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');

// ✅ POST /api/orders - Place a new order (protected)
router.post('/', authMiddleware, async (req, res) => {
  const { items, address } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items provided.' });
  }

  try {
    const newOrder = new Order({
      user: req.user.id,
      address,
      items: items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1
      }))
    });

    const savedOrder = await newOrder.save();

    // ✅ Decrease inStock for each ordered product
    for (let item of newOrder.items) {
      const product = await Product.findOne({ name: item.name }); // or use _id later
      if (product) {
        product.inStock = Math.max(product.inStock - item.quantity, 0); // prevent negative stock
        await product.save();
      } else {
        console.log(`❌ Product not found for item: ${item.name}`);
      }
    }

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("❌ Order save error:", err);
    res.status(500).json({ message: 'Failed to place order.' });
  }
});

// ✅ GET /api/orders/my - Fetch user's own orders (protected)
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
});

// ✅ GET /api/orders - Admin: Get all orders (with user email populated)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'email');
    const formatted = orders.map(order => ({
      ...order._doc,
      user: order.user
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET /api/orders/count - Get total order count
router.get('/count', async (req, res) => {
  try {
    const count = await Order.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
