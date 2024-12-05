const mongoose = require('mongoose');

const helpDeskTicketSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  message: { type: String, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
  replies: [{
    message: { type: String },
    isStaff: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const HelpDeskTicket = mongoose.model('HelpDeskTicket', helpDeskTicketSchema);

module.exports = HelpDeskTicket;

