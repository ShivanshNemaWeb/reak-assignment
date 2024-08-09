const jwt = require('jsonwebtoken');
const secretKey = 'mfwcnwo2jrue3xx3u2ujxurxxu';

// Sample user data
const users = {
  admin: { password: 'admin123', role: 'admin' },
  regular: { password: 'user123', role: 'regular' }
};

// Function to generate JWT token
const generateToken = (username, role) => {
  return jwt.sign({ username, role }, secretKey, { expiresIn: '1h' });
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  const user = users[username];

  if (user && user.password === password) {
    const token = generateToken(username, user.role);
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};
