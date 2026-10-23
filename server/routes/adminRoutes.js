const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');

// Apply the verifyToken middleware to protect this route
router.get('/dashboard', verifyToken, (req, res) => {
  res.json({ message: "Access granted to admin dashboard.", uid: req.user.uid });
});

// Protect other admin actions
router.post('/promo', verifyToken, createPromoController);
router.post('/block-dates', verifyToken, blockDatesController);

module.exports = router;