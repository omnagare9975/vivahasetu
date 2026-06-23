const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const {
  getDashboardStats, getAllUsers, toggleUserSuspension, deleteUser,
  updateVerificationStatus, getPendingVerifications, getAllPayments,
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-suspension', toggleUserSuspension);
router.delete('/users/:id', deleteUser);
router.get('/verifications', getPendingVerifications);
router.put('/verifications/:id', updateVerificationStatus);
router.get('/payments', getAllPayments);

module.exports = router;
