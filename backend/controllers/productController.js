const Product = require('../models/Product');

// @desc    Get all products (with search, filter, sort)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let query = {};

    // Filter out products with no image
    query.image = { $exists: true, $ne: '' };

    // 1. Search Query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Category Filter
    if (category && category !== 'All') {
      query.category = category;
    }

    let apiQuery = Product.find(query);

    // 3. Sorting
    if (sort) {
      if (sort === 'priceAsc') {
        apiQuery = apiQuery.sort('price');
      } else if (sort === 'priceDesc') {
        apiQuery = apiQuery.sort('-price');
      } else if (sort === 'newest') {
        apiQuery = apiQuery.sort('-createdAt');
      }
    } else {
      // Default sort is newest
      apiQuery = apiQuery.sort('-createdAt');
    }

    const products = await apiQuery;

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Admin / Simulated)
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, image, category, stock } = req.body;

    const product = await Product.create({
      name,
      price,
      description,
      image,
      category,
      stock
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
