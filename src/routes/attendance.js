const express = require('express');
const {
  getAttendance,
  markAttendance,
  updateAttendance,
} = require('../controllers/attendanceController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// All attendance routes require login
router.use(protect);

router.get('/', getAttendance);
router.post('/', restrictTo('teacher', 'admin'), markAttendance);
router.put('/:id', restrictTo('teacher', 'admin'), updateAttendance);

module.exports = router;
