// server/models/MembershipSubscription.js
const mongoose = require('mongoose');

const membershipSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MembershipPlan',
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  paymentMethod: {
    type: String,
    required: true
  },
  autoRenew: {
    type: Boolean,
    default: true
  }
});

const MembershipSubscription = mongoose.model('MembershipSubscription', membershipSubscriptionSchema);
module.exports = MembershipSubscription;
