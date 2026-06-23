const { sendError } = require('../utils/apiResponse');

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return sendError(res, 403, 'Admin access required');
  }
  next();
};

const premiumOnly = (req, res, next) => {
  if (!['premium', 'admin'].includes(req.user?.role)) {
    return sendError(res, 403, 'Premium membership required');
  }
  next();
};

module.exports = { adminOnly, premiumOnly };
