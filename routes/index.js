const loginRoutes = require('./login');
const bookRoutes = require('./book');

const express = require('express');
const router = express.Router();

router.use('/login',loginRoutes);
router.use('/book',bookRoutes);

module.exports = router;