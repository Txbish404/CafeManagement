const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const emailTemplates = {
  orderConfirmation: (order) => ({
    subject: `Order Confirmation #${order._id}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Your order #${order._id} has been confirmed.</p>
      <h2>Order Details:</h2>
      <ul>
        ${order.items.map(item => `
          <li>${item.quantity}x ${item.name} - $${item.price.toFixed(2)}</li>
        `).join('')}
      </ul>
      <p><strong>Total: $${order.total.toFixed(2)}</strong></p>
      <p>Track your order status at: ${process.env.CLIENT_URL}/orders</p>
    `,
  }),
  
  orderStatusUpdate: (order) => ({
    subject: `Order #${order._id} Status Update`,
    html: `
      <h1>Order Status Update</h1>
      <p>Your order #${order._id} status has been updated to: ${order.status}</p>
      <p>Track your order at: ${process.env.CLIENT_URL}/orders</p>
    `,
  }),
};

const sendEmail = async (to, template, data) => {
  try {
    const { subject, html } = emailTemplates[template](data);
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully: ${template} to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmail };
