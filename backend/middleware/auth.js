const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return sendError(res, 401, 'Not authorized, no token');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return sendError(res, 401, 'User not found');
    if (user.isSuspended) return sendError(res, 403, 'Account suspended');
    req.user = user;
    next();
  } catch {
    return sendError(res, 401, 'Not authorized, token failed');
  }
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      // ignore
    }
  }
  next();
};

module.exports = { protect, optionalAuth };
