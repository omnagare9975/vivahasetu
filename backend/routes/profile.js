const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { upload, uploadDocument } = require('../config/cloudinary');
const { uploadLimiter } = require('../middleware/rateLimiter');
const {
  getMyProfile, getProfileById, updateProfile,
  uploadPhoto, deletePhoto, setProfilePhoto, getMyPhotos,
  uploadProfessionDocument, getProfessionVerificationStatus,
} = require('../controllers/profileController');

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateProfile);
router.get('/photos', protect, getMyPhotos);
router.post('/photos', protect, uploadLimiter, upload.single('photo'), uploadPhoto);
router.delete('/photos/:photoId', protect, deletePhoto);
router.put('/photos/:photoId/set-profile', protect, setProfilePhoto);

router.get('/profession-verification', protect, getProfessionVerificationStatus);
router.post(
  '/profession-verification',
  protect,
  uploadLimiter,
  uploadDocument.single('document'),
  uploadProfessionDocument
);

router.get('/:id', optionalAuth, getProfileById);

module.exports = router;
