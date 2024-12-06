const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

class AnalyticsService {
  async getDailySales(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      }
    ]);
  }

  async getPopularItems(startDate, endDate) {
    return await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);
  }

  async getCustomerMetrics() {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const activeCustomers = await Order.distinct('customer').length;
    
    return {
      totalCustomers,
      activeCustomers,
      retentionRate: (activeCustomers / totalCustomers) * 100
    };
  }

  async getInventoryAlerts() {
    return await MenuItem.find({
      quantity: { $lte: '$threshold' }
    }).select('name quantity threshold');
  }
}

module.exports = new AnalyticsService();
