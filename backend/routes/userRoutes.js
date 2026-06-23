const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  getUserProfile,
  getUsers,
  deleteUser,
  updateUserRole,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/login', authUser);
router.route('/profile').get(protect, getUserProfile);
router.route('/:id').delete(protect, admin, deleteUser);
router.route('/:id/role').put(protect, admin, updateUserRole);

module.exports = router;

