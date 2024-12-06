const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Log = require('../models/Log');
const UserActivity = require('../models/UserActivity');
const HelpDeskTicket = require('../models/HelpDeskTicket');
const Feedback = require('../models/Feedback');
const MenuItem = require('../models/MenuItem');

// Dashboard Routes
router.get('/dashboard-stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeOrders = await Order.countDocuments({ status: 'active' });
    const todayRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalMenuItems = await MenuItem.countDocuments();

    res.json({
      totalUsers,
      activeOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
      totalMenuItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard statistics', error: error.message });
  }
});

router.get('/sales-data', async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, sales: { $sum: "$total" } } },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", sales: 1, _id: 0 } }
    ]);
    res.json(salesData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales data', error: error.message });
  }
});

// User Management Routes
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ status: "Active" });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting user', error: error.message });
  }
});

// System Monitoring Routes
router.get('/logs', async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
});

router.get('/user-activity', async (req, res) => {
  try {
    const activity = await UserActivity.find().sort({ timestamp: -1 }).limit(100);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user activity', error: error.message });
  }
});

// Help Desk Routes
router.get('/help-desk/tickets', async (req, res) => {
  try {
    const tickets = await HelpDeskTicket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching help desk tickets', error: error.message });
  }
});

router.post('/help-desk/tickets/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const ticket = await HelpDeskTicket.findByIdAndUpdate(id, 
      { $push: { replies: { message: reply, isAdmin: true } }, status: 'Answered' },
      { new: true }
    );
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error replying to ticket', error: error.message });
  }
});

// Feedback Monitoring Routes
router.get('/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('user', 'username') // Populate the user field with the username
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback', error: error.message });
  }
});

// Registration Approval Routes
router.get('/pending-registrations', async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'Pending' });
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending registrations', error: error.message });
  }
});

router.post('/approve-registration/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    if (approved) {
      // Approve the user by updating their status to 'Active'
      await User.findByIdAndUpdate(id, { status: 'Active' });
      res.json({ message: 'User  registration approved successfully' });
    } else {
      // Reject the user by deleting them from the database
      await User.findByIdAndDelete(id);
      res.json({ message: 'User  registration rejected and removed successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating user registration', error: error.message });
  }
});

module.exports = router;

