const express = require('express');
const router = express.Router();
const traineeController = require('../controllers/traineeController');

router.get('/', traineeController.getTrainees);
router.post('/', traineeController.createTrainee);
router.put('/:id', traineeController.updateTrainee);
router.delete('/:id', traineeController.deleteTrainee);

module.exports = router;