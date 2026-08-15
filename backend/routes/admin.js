const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const {
  getDashboardStats, getAllUsers, toggleUserSuspension, deleteUser,
  updateVerificationStatus, getPendingVerifications, getAllPayments,
  getReports, updateReportStatus,
  getProfessionVerifications, updateProfessionVerification,
  getSupportTickets,
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-suspension', toggleUserSuspension);
router.delete('/users/:id', deleteUser);
router.get('/verifications', getPendingVerifications);
router.put('/verifications/:id', updateVerificationStatus);
router.get('/payments', getAllPayments);
router.get('/reports', getReports);
router.put('/reports/:id', updateReportStatus);
router.get('/profession-verifications', getProfessionVerifications);
router.put('/profession-verifications/:id', updateProfessionVerification);
router.get('/support', getSupportTickets);

module.exports = router;
