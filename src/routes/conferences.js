const express = require('express');
const { getAllConferences, getConferenceById, createConference, completeConference, updateConference } = require('../controllers/conferenceController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/',    getAllConferences);
router.get('/:id', getConferenceById);
router.post('/',   restrictTo('guidance_counselor', 'admin'), createConference);
router.put('/:id', restrictTo('guidance_counselor', 'admin'), updateConference);
router.patch('/:id/complete', restrictTo('guidance_counselor', 'admin'), completeConference);

module.exports = router;
