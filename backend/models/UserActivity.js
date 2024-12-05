const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  username: { type: String, required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserActivity', userActivitySchema);

