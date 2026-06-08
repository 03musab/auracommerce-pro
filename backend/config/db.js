const mongoose = require('mongoose');
const Product = require('../models/Product');

const defaultProducts = [
  {
    name: 'AeroMax Pro Headphones',
    price: 28999.00,
    description: 'Experience pure audio bliss with active noise cancellation, spatial audio, and premium memory foam ear cushions. Designed for audiophiles who demand the absolute best in sound dynamics and luxurious comfort.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60',
    category: 'Audio',
    stock: 25
  },
  {
    name: 'AuraBook Pro 14"',
    price: 159999.00,
    description: 'Unleash ultimate power with the next-generation M-Series silicon chip. Features a breathtaking 120Hz Liquid Retina display, 16GB of unified memory, and up to 18 hours of battery life to fuel your creative genius.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60',
    category: 'Computers',
    stock: 10
  },
  {
    name: 'Pulse Watch Horizon',
    price: 24999.00,
    description: 'A premium smart wearable designed to navigate life with you. Tracks blood oxygen levels, Sleep Score, heart rates, and sports performance. Beautiful curved glass display with customizable watch faces.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60',
    category: 'Wearables',
    stock: 40
  },
  {
    name: 'Velocity Sport Sneaker',
    price: 12999.00,
    description: 'Defy gravity with advanced foam cushioning and reactive mesh uppers. Built for maximum speed, traction, and style. The perfect crossover between professional athletic running and urban streetwear.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60',
    category: 'Apparel',
    stock: 50
  },
  {
    name: 'Lumix Mechanical Keyboard',
    price: 14999.00,
    description: 'Hot-swappable custom mechanical keyboard featuring tactile brown switches, double-shot PBT keycaps, and a gorgeous aluminum frame. Fully compatible with Windows, Mac, and Linux.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60',
    category: 'Accessories',
    stock: 15
  },
  {
    name: 'Vanguard Travel Backpack',
    price: 9999.00,
    description: 'Weatherproof premium travel pack with modular compartments, quick-access pockets, and dedicated padded sleeve for 16-inch laptops. Fits carry-on requirements and is engineered for digital nomads.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=60',
    category: 'Apparel',
    stock: 20
  }
];

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auracommerce');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Auto-seed if database has 0 products
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('Database product catalog is empty. Auto-seeding default products...');
      await Product.insertMany(defaultProducts);
      console.log('Database seeded successfully!');
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
