const jwt = require('jsonwebtoken');
const secretKey = 'mfwcnwo2jrue3xx3u2ujxurxxu';

exports.authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user; // Save user info in the request object
    next();
  });
};

 exports.checkAdminRole = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  next();
};
