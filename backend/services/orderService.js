const Order = require('../models/Order');
const WebSocketService = require('./websocketService');
const emailService = require('./emailService');

class OrderService {
  constructor(wsService) {
    this.wsService = wsService;
  }

  async createOrder(orderData) {
    const order = new Order(orderData);
    await order.save();

    // Notify staff about new order
    this.wsService.notifyStaff({
      type: 'NEW_ORDER',
      data: order
    });

    // Send confirmation email to customer
    await emailService.sendEmail(
      order.customer.email,
      'orderConfirmation',
      order
    );

    return order;
  }

  async updateOrderStatus(orderId, status) {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('customer');

    if (!order) {
      throw new Error('Order not found');
    }

    // Notify customer about status update
    this.wsService.notifyUser(order.customer._id, {
      type: 'ORDER_STATUS_UPDATE',
      data: order
    });

    // Send status update email
    await emailService.sendEmail(
      order.customer.email,
      'orderStatusUpdate',
      order
    );

    return order;
  }
}

module.exports = OrderService;

