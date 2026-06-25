const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/stats', reportController.getStats);
router.get('/revenue-by-month', reportController.getRevenueByMonth);

module.exports = router;