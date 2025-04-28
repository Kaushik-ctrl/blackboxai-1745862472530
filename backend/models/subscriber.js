const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  verified: { type: Boolean, default: false },
  preferences: { type: Object, default: {} },
  verificationToken: { type: String },
  unsubscribeToken: { type: String },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Subscriber', subscriberSchema);
