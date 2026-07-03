const express = require('express');
const {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/',     getAnnouncements);
router.post('/',    restrictTo('teacher', 'admin'), createAnnouncement);
router.delete('/:id', restrictTo('admin'), deleteAnnouncement);

module.exports = router;
