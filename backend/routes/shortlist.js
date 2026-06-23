const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { addToShortlist, removeFromShortlist, getShortlist } = require('../controllers/shortlistController');

router.get('/', protect, getShortlist);
router.post('/:userId', protect, addToShortlist);
router.delete('/:userId', protect, removeFromShortlist);

module.exports = router;
