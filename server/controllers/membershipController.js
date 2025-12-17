// server/controllers/membershipController.js
const MembershipPlan = require('../models/MembershipPlan');
const MembershipSubscription = require('../models/MembershipSubscription');

// Get all membership plans
// server/controllers/membershipController.js
exports.getAllPlans = async (req, res) => {
  try {
    console.log('Getting all membership plans');
    const plans = await MembershipPlan.find({});
    console.log('Found plans:', plans);
    res.json(plans);
  } catch (error) {
    console.error('Error in getAllPlans:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single plan
exports.getPlan = async (req, res) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new membership subscription
exports.createSubscription = async (req, res) => {
  try {
    const { planId, paymentMethod } = req.body;
    const userId = req.user.id;
    
    // Find the plan
    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    // Calculate end date based on plan period
    const startDate = new Date();
    const endDate = new Date();
    if (plan.period === 'month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.period === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    // Create subscription
    const subscription = new MembershipSubscription({
      user: userId,
      plan: planId,
      startDate,
      endDate,
      paymentMethod
    });
    
    await subscription.save();
    
    res.status(201).json({
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's active subscription
// server/controllers/membershipController.js
// server/controllers/membershipController.js
exports.getUserSubscription = async (req, res) => {
  try {
    // Log for debugging
    console.log('Getting subscription for user:', req.user.id);
    
    const userId = req.user.id;
    
    const subscription = await MembershipSubscription.findOne({
      user: userId,
      status: 'active'
    }).populate('plan');
    
    if (!subscription) {
      // Return a 200 with null data instead of 404
      console.log('No active subscription found for user:', userId);
      return res.status(200).json({ subscription: null });
    }
    
    console.log('Found subscription:', subscription);
    res.status(200).json({ subscription });
  } catch (error) {
    console.error('Error in getUserSubscription:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


