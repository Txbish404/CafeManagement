// routes/otp.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const OTP = require('../models/OTP'); // Create an OTP model to store OTPs
const User = require('../models/User'); // Assuming you have a User model

// Middleware to parse JSON bodies
router.use(express.json());

// Generate and send OTP
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

  // Save OTP to the database
  const newOtp = new OTP({ email, otp });
  try {
    await newOtp.save();
  } catch (error) {
    console.error('Error saving OTP to the database:', error);
    return res.status(500).json({ error: 'Failed to save OTP' });
  }

  // Send OTP via email
    const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "haroonmust123@gmail.com",
      pass: 'krtv xqdx wivy vnxf'
    }
  });

  const mailOptions = {
    from: "haroonmust123@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending OTP:', error);
      return res.status(500).json({ error: 'Failed to send OTP' });
    }
    res.status(200).json({ message: 'OTP sent successfully' });
  });
});

router.post('/verify-otp', async (req, res) => {
  console.log('Received data for OTP verification:', req.body);
  const { email, otp } = req.body;

  const otpRecord = await OTP.findOne({ email, otp });

  if (!otpRecord) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  await OTP.deleteOne({ email, otp });

  res.status(200).json({ message: 'OTP verified successfully' });
});


module.exports = router;