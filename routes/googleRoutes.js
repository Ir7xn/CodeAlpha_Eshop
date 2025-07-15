const User = require('../models/User');
const express = require("express");
const passport = require("passport");
const router = express.Router();
const jwt = require('jsonwebtoken');



// Start Google auth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth.html' }),
  async (req, res) => {
    try {
      const { name, email, googleId } = req.user;

      if (!email) {
        return res.redirect('/auth.html?error=email_missing');
      }

      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          name,
          email,
          googleId,
          password: null
        });
        await user.save();
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Send token to frontend via query or cookie
      res.redirect(`/index.html?token=${token}&name=${encodeURIComponent(user.name)}`);
    } catch (err) {
      console.error("Error during Google callback:", err);
      res.redirect('/auth.html');
    }
  }
);




// Failure
router.get("/failure", (req, res) => {
  res.send("❌ Google Login Failed");
});

module.exports = router;
