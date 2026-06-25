const Product = require('../models/Product');
const { normalizeProductImage } = require('../utils/productImages');

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    res.json(products.map(normalizeProductImage));
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
      res.json(normalizeProductImage(product));
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Seed products (for testing and initializing db)
// @route   POST /api/products/seed
// @access  Public
const seedProducts = async (req, res) => {
  try {
    // Data extracted from frontend design
    const sampleProducts = [
      {
        name: 'Surge Trainer Pro',
        sku: 'STP-001',
        category: 'Footwear',
        price: 148,
        stock: 50,
        description: 'Engineered footwear, tested by athletes.',
        oldPrice: 185,
        rating: 4.8,
        reviews: 212,
        badge: 'sale',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80'
      },
      {
        name: 'Aero-Flex Compression Tee',
        sku: 'Aero-002',
        category: 'Apparel',
        price: 54,
        stock: 100,
        description: 'Aero-Flex Compression Tee for training.',
        rating: 4.6,
        reviews: 98,
        badge: 'new',
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&q=80'
      },
      {
        name: 'Velocity Resistance Bands',
        sku: 'VRB-003',
        category: 'Accessories',
        price: 32,
        stock: 30,
        description: 'High quality resistance bands.',
        oldPrice: 42,
        rating: 4.9,
        reviews: 340,
        badge: 'sale',
        image: 'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=500&q=80'
      },
      {
        name: 'Trailhead GTX Mid',
        sku: 'TGM-004',
        category: 'Footwear',
        price: 172,
        stock: 15,
        description: 'Trailhead GTX Mid for running.',
        rating: 4.7,
        reviews: 156,
        badge: 'low',
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&q=80'
      },
      {
        name: 'Iron Grip Lifting Gloves',
        sku: 'IGL-005',
        category: 'Training',
        price: 28,
        stock: 200,
        description: 'Iron Grip Lifting Gloves.',
        rating: 4.5,
        reviews: 511,
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80'
      },
      {
        name: 'Momentum Joggers',
        sku: 'MJ-006',
        category: 'Apparel',
        price: 68,
        stock: 60,
        description: 'Momentum Joggers.',
        oldPrice: 88,
        rating: 4.7,
        reviews: 289,
        badge: 'sale',
        image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&q=80'
      },
      {
        name: 'Glacier 1L Steel Bottle',
        sku: 'GSB-007',
        category: 'Hydration',
        price: 36,
        stock: 120,
        description: 'Glacier 1L Steel Bottle.',
        rating: 4.9,
        reviews: 677,
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80'
      },
      {
        name: 'Cadence Court Mid',
        sku: 'CCM-008',
        category: 'Footwear',
        price: 134,
        stock: 8,
        description: 'Cadence Court Mid.',
        rating: 4.6,
        reviews: 143,
        badge: 'new',
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80'
      }
    ];

    // Clear existing products and insert new ones
    await Product.deleteMany();
    const createdProducts = await Product.insertMany(sampleProducts);
    res.status(201).json({ message: 'Products Seeded Successfully', count: createdProducts.length });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name || 'Sample name',
      sku: req.body.sku || 'SKU-000',
      price: req.body.price || 0,
      user: req.user._id,
      image: req.body.image || '',
      category: req.body.category || 'Sample category',
      stock: req.body.stock || 0,
      description: req.body.description || 'Sample description',
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  seedProducts,
  createProduct,
  deleteProduct
};
