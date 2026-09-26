const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUserRole
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);

module.exports = router;