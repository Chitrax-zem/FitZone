// server/routes/classRoutes.js
const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const {auth} = require('../middleware/auth');

// Get all classes
router.get('/', classController.getAllClasses);

// Get classes by day
router.get('/day/:day', classController.getClassesByDay);

// Book a class (protected)
router.post('/book', auth, classController.bookClass);

module.exports = router;
