// server/models/MembershipPlan.js
const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  period: {
    type: String,
    enum: ['month', 'year'],
    default: 'month'
  },
  features: [{
    type: String,
    trim: true
  }],
  popular: {
    type: Boolean,
    default: false
  },
  iconClass: {
    type: String,
    default: 'plan-icon-blue'
  }
});

const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema);
module.exports = MembershipPlan;
