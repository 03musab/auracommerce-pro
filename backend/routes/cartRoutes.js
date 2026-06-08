const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, deleteCartItem } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// All cart routes require user login
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart);

router.route('/:id')
  .put(updateCartItem)
  .delete(deleteCartItem);

module.exports = router;
