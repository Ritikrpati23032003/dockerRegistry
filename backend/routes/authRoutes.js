const express = require('express');
const router = express.Router();
const { dockerAuth } = require('../controllers/authController');

// Docker Registry calls this endpoint to get a token
router.get('/', dockerAuth);

module.exports = router;