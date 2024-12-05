const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const colors = require('colors');
// // const WebSocketService = require('./services/websocketService');
const customerRoutes = require('./routes/customer');
const staffRoutes = require('./routes/staff');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const connectDB = require('./config/db'); // Database connection
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

app.get('/', (req, res) => {
  res.send('API is running...');
});


// Middleware
app.use(express.json());
app.use(cors());



// Routes
app.use('/api/customer', customerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);



app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});