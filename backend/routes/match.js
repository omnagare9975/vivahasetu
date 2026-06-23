const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSuggestedMatches, searchProfiles } = require('../controllers/matchController');

router.get('/suggestions', protect, getSuggestedMatches);
router.get('/search', protect, searchProfiles);

module.exports = router;
