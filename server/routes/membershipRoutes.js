// server/routes/membershipRoutes.js
const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');
const { auth } = require('../middleware/auth');

// Get all membership plans
router.get('/plans', membershipController.getAllPlans);

// Get a single plan
router.get('/plans/:id', membershipController.getPlan);

// Create a new membership subscription (protected)
router.post('/subscribe', auth, membershipController.createSubscription);

// Get user's active subscription (protected)
router.get('/my-subscription', auth, membershipController.getUserSubscription);

module.exports = router;
