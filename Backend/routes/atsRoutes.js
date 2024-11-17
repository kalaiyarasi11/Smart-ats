const express = require('express');
const router = express.Router();
const atsController = require('../controllers/atsController');
const upload = require('../middlewares/filemiddleware');

// Define routes
router.post('/upload', upload.single('resume'), atsController.calculateATSScore);

module.exports = router;
