const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart items
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.user._id }).populate('productId');
    
    const items = [];
    for (const item of cartItems) {
      if (!item.productId) {
        // Clean up dangling references of deleted products automatically
        await Cart.findByIdAndDelete(item._id);
      } else {
        items.push({
          _id: item._id,
          productId: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          image: item.productId.image,
          category: item.productId.category,
          stock: item.productId.stock,
          quantity: item.quantity
        });
      }
    }

    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const qty = quantity ? parseInt(quantity) : 1;

    // Check if item already exists in cart
    let cartItem = await Cart.findOne({ userId: req.user._id, productId });
    const currentQty = cartItem ? cartItem.quantity : 0;

    // Enforce stock limits
    if (product.stock < (currentQty + qty)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot add more units. Available stock: ${product.stock}. You already have ${currentQty} in your cart.` 
      });
    }

    if (cartItem) {
      cartItem.quantity += qty;
      await cartItem.save();
    } else {
      cartItem = await Cart.create({
        userId: req.user._id,
        productId,
        quantity: qty
      });
    }

    const populated = await Cart.findById(cartItem._id).populate('productId');

    res.status(201).json({
      success: true,
      data: {
        _id: populated._id,
        productId: populated.productId._id,
        name: populated.productId.name,
        price: populated.productId.price,
        image: populated.productId.image,
        category: populated.productId.category,
        stock: populated.productId.stock,
        quantity: populated.quantity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    let cartItem = await Cart.findById(req.params.id).populate('productId');

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    // Verify ownership
    if (cartItem.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Verify stock
    const product = cartItem.productId;
    if (product && product.stock < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${product.stock} units are available in stock.` 
      });
    }

    cartItem.quantity = parseInt(quantity);
    await cartItem.save();

    res.status(200).json({
      success: true,
      data: {
        _id: cartItem._id,
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        stock: product.stock,
        quantity: cartItem.quantity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete cart item
// @route   DELETE /api/cart/:id
// @access  Private
exports.deleteCartItem = async (req, res) => {
  try {
    const cartItem = await Cart.findById(req.params.id);

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    // Verify ownership
    if (cartItem.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await Cart.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
