const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { customerName, address, mobile } = req.body;

    if (!customerName || !address || !mobile) {
      return res.status(400).json({ success: false, message: 'Please provide name, address, and mobile number' });
    }

    // Fetch user's cart items
    const cartItems = await Cart.find({ userId: req.user._id }).populate('productId');

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    let total = 0;
    const orderItems = [];

    // Check stock, calculate total, format order items
    for (const item of cartItems) {
      if (!item.productId) {
        continue;
      }
      
      const product = item.productId;

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Ordered: ${item.quantity}`
        });
      }

      total += product.price * item.quantity;
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: item.quantity
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid products in cart' });
    }

    // Create order
    const order = await Order.create({
      userId: req.user._id,
      customerName,
      address,
      mobile,
      items: orderItems,
      total
    });

    // Deduct stock levels and clear cart
    for (const item of cartItems) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId._id, {
          $inc: { stock: -item.quantity }
        });
      }
      await Cart.findByIdAndDelete(item._id);
    }

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
