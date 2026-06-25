const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductImage,
  seedProducts,
  createProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/seed').post(seedProducts);
router.route('/:id/image.svg').get(getProductImage);
router.route('/:id').get(getProductById).delete(protect, admin, deleteProduct);

module.exports = router;
