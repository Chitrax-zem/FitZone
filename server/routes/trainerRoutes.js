// server/routes/trainerRoutes.js
const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');
const {auth}= require('../middleware/auth');

// Get all trainers
router.get('/', trainerController.getAllTrainers);

// Get a single trainer
router.get('/:id', trainerController.getTrainer);

// Book a session with a trainer (protected)
router.post('/book', auth, trainerController.bookTrainerSession);

module.exports = router;
