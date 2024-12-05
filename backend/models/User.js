const mongoose = require('mongoose');
const { type } = require('os');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['admin', 'staff', 'customer'], required: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  status: { type: String, enum: ['Pending', 'Active', 'Rejected'], default: 'Pending' },
  twoFactorSecret: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  phone:{ type: Number},
  address:{ type: String},
  dietaryPreferences: {type: String},
  allergies: {type: String},
  tokens: [
    {
      token: { type: String},
    },
  ],});

module.exports = mongoose.model('User', userSchema);

