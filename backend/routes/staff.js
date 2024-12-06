const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const InventoryItem = require('../models/Inventory');
const Promotion = require('../models/Promotion');
const HelpDeskTicket = require('../models/HelpDeskTicket');

// const authenticate = require('../middleware/auth');

// Apply authentication and authorization to all routes
// router.use(authenticate);

// Menu Management Routes
router.get('/menu', async (req, res) => {
  try {
    const menuItems = await MenuItem.find().sort({ category: 1, name: 1 });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu items', error: error.message });
  }
});

router.post('/menu', async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(400).json({ message: 'Error creating menu item', error: error.message });
  }
});

router.put('/menu/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ message: 'Error updating menu item', error: error.message });
  }
});

router.delete('/menu/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting menu item', error: error.message });
  }
});

// Order Management Routes
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'username')//-----------------------------------------------------------------------------------------
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

router.put('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('customer', 'username');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error updating order', error: error.message });
  }
});

// Assuming you have an endpoint for updating order status
router.put('/orders/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndUpdate(id, { status: 'Cancelled' });
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
});

// Reports Routes
router.get('/reports/sales', async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const formattedData = salesData.map(({ _id, sales }) => ({ date: _id, sales }));
    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales data', error: error.message });
  }
});

router.get('/reports/popular-items', async (req, res) => {
  try {
    const popularItems = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.itemId",
          name: { $first: "$items.name" },
          soldCount: { $sum: "$items.quantity" },
        },
      },
      { $sort: { soldCount: -1 } },
      { $limit: 10 },
    ]);
    res.json(popularItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching popular items', error: error.message });
  }
});

router.get('/inventory', async (req, res) => {
  try {
    const inventoryItems = await InventoryItem.find().sort({ item: 1 });
    res.json(inventoryItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory items', error: error.message });
  }
});

// Add a new inventory item
router.post('/inventory', async (req, res) => {
  try {
    const inventoryItem = new InventoryItem(req.body);
    await inventoryItem.save();
    res.status(201).json(inventoryItem);
  } catch (error) {
    res.status(400).json({ message: 'Error creating inventory item', error: error.message });
  }
});

// Update an inventory item
router.put('/inventory/:id', async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json(inventoryItem);
  } catch (error) {
    res.status(400).json({ message: 'Error updating inventory item', error: error.message });
  }
});

// Delete an inventory item
router.delete('/inventory/:id', async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting inventory item', error: error.message });
  }
});

// Get all promotions
router.get('/promotions', async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ expirationDate: 1 }); // Sort by expiration date
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching promotions', error: error.message });
  }
});

// Create a new promotion
router.post('/promotions', async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();
    res.status(201).json(promotion);
  } catch (error) {
    res.status(400).json({ message: 'Error creating promotion', error: error.message });
  }
});

// Update a promotion by ID
router.put('/promotions/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    res.json(promotion);
  } catch (error) {
    res.status(400).json({ message: 'Error updating promotion', error: error.message });
  }
});

// Delete a promotion by ID
router.delete('/promotions/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting promotion', error: error.message });
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

module.exports = router;