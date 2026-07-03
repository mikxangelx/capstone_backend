const express = require('express');
const { getAllCases, getCaseById, createCase, updateCase, resolveCase } = require('../controllers/caseController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/',    getAllCases);
router.get('/:id', getCaseById);
router.post('/',   restrictTo('teacher', 'guidance_counselor', 'admin'), createCase);
router.put('/:id', restrictTo('guidance_counselor', 'admin'), updateCase);
router.patch('/:id/resolve', restrictTo('guidance_counselor', 'admin'), resolveCase);

module.exports = router;
