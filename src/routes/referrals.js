const express = require('express');
const { getAllReferrals, createReferral, scheduleReferral, declineReferral } = require('../controllers/referralController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/',  getAllReferrals);
router.post('/', restrictTo('teacher', 'admin'), createReferral);
router.patch('/:id/schedule', restrictTo('guidance_counselor', 'admin'), scheduleReferral);
router.patch('/:id/decline',  restrictTo('guidance_counselor', 'admin'), declineReferral);

module.exports = router;
