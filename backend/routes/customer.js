const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const MenuItem = require('../models/MenuItem'); 
const Cart = require('../models/Cart'); 
const HelpDeskTicket = require('../models/HelpDeskTicket');
const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const User = require('../models/User');
const Reservation = require('../models/Reservation');
require('dotenv').config(); 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
console.log('Stripe Key:', process.env.STRIPE_SECRET_KEY);

// Menu Routes
router.get('/menu', async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu', error: error.message });
  }
});

// Get cart items
router.get('/cart', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.menuItem');
    console.log(req.user._id);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.menuItem.toString() === menuItemId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ menuItem: menuItemId, quantity });
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
});

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects the amount in cents
      currency: 'usd',
      metadata: {
        userId: req.user._id.toString()
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment intent', error: error.message });
  }
});

// Update item quantity in cart
router.put('/update/:itemId',auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = quantity;

    await cart.save();
    await cart.populate('items.menuItem');

    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: 'Error updating cart item', error: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:itemId',auth, async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    await cart.save();
    await cart.populate('items.menuItem');

    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: 'Error removing item from cart', error: error.message });
  }
});

// Clear cart
router.delete('/clear',auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error clearing cart', error: error.message });
  }
});

// Order Routes
router.post('/orders', async (req, res) => {
  try {
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(req.body.total * 100),
      currency: 'usd',
      metadata: {
        userId: req.user._id.toString()
      }
    });

    // Create order
    const order = new Order({
      customer: req.user._id,
      items: req.body.items,
      total: req.body.total,
      paymentIntentId: paymentIntent.id
    });

    await order.save();

    res.status(201).json({
      order,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating order', error: error.message });
  }
});

router.get('/orders',auth, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 }).populate('items.menuItem');
      console.log(orders);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});


// Get user's reservations
router.get('/reservations',auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ customer: req.user._id }).sort({ date: 1, time: 1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
});

// Create a new reservation
router.post('/reservations',auth, async (req, res) => {
  try {
    const { date, time, partySize } = req.body;
    console.log('Request body:', req.body); // Log the request body
    const newReservation = new Reservation({
      customer: req.user._id,
      date,
      time,
      partySize
    });
    await newReservation.save();
    res.status(201).json(newReservation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating reservation', error: error.message });
  }
});

// Cancel a reservation
router.delete('/reservations/:id', auth, async (req, res) => {
  try {
    console.log('Parameters', req.params.id);
    console.log('User', req.user._id);
    const reservation = await Reservation.findById(req.params.id);
    console.log('Reservation:', reservation);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    if (reservation.customer == req.user._id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reservation cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling reservation', error: error.message });
  }
});

// Route to get user profile
router.get('/profile',auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Route to update user profile
router.put('/profile',auth, async (req, res) => {
  try {
    const updatedProfile = req.body;
    const user = await User.findByIdAndUpdate(req.user._id 
      , updatedProfile,
      { new: true }
    );

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Create a new ticket (Customer)
router.post('/helpdesk', auth, async (req, res) => {
  try {
    const { subject, message } = req.body;
    const ticket = new HelpDeskTicket({
      customer: req.user._id,
      subject,
      message,
    });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error creating helpdesk ticket', error: error.message });
  }
});

// Get all tickets for the logged-in customer
router.get('/helpdesk',auth, async (req, res) => {
  try {
    const tickets = await HelpDeskTicket.find({ customer: req.user._id });
    console.log(tickets);
    console.log(req.user._id);
    res.json(tickets);
    } catch (error) {
      console.error('Error fetching helpdesk tickets:', error);
      res.status(500).json({ message: 'Error fetching helpdesk tickets' });
    }
});

router.post('/feedback', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const feedback = new Feedback({
      user: req.user._id,
      rating,
      comment,
    });
    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting feedback', error: error.message });
  }
});

//customer/me
router.get('/me', auth, async (req, res) => {
  try {
    const user
      = await User.findById(req.user._id);
    res.json(user);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      res.status(500).json({ message: 'Error fetching customer data' });
    }
});

module.exports = router;
