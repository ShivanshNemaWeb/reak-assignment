const express = require('express');
const { bookController } = require('../controllers');
const { authenticateToken, checkAdminRole } = require('../middleware/auth');

const router = express.Router();

router.get('/home', authenticateToken, bookController.home);
router.post('/addBook', authenticateToken, checkAdminRole, bookController.addBook);
router.delete('/deleteBook', authenticateToken, checkAdminRole, bookController.deleteBook);

module.exports = router;
