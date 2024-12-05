const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const colors = require('colors');
const http = require('http');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const staffRoutes = require('./routes/staff');
const customerRoutes = require('./routes/customer');
const otpRouter = require('./routes/otp'); // Adjust the path as needed
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/db'); // Database connection

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

// Define API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/otp', otpRouter);

app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});