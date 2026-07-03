const express = require('express');
const { getAllUsers, getAllStudents, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/students', getAllStudents);
router.get('/',    restrictTo('admin'), getAllUsers);
router.get('/:id', getUserById);
router.post('/',   restrictTo('admin'), createUser);
router.put('/:id', restrictTo('admin'), updateUser);
router.delete('/:id', restrictTo('admin'), deleteUser);

module.exports = router;
