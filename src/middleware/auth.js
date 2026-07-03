const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protects routes — only logged-in users can access
const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized. Please log in.' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Restricts access to specific roles (e.g. teacher only)
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. This route is for ${roles.join('/')} only.`,
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
