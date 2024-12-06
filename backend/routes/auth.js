const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const { generateKey } = require('crypto');

const router = express.Router();

// Middleware to parse JSON bodies
router.use(express.json());

router.post('/register', async (req, res) => {
  const { username, email, password, role, firstName, lastName, address } = req.body;

  // Validate the request body
  if (!username || !email || !password || !role || !firstName || !lastName || !address) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role,
    firstName,
    lastName,
    address,
  });

  try {
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // Validate the request body
  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  // Compare the password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  // Generate the token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  // Save the token
  user.tokens = user.tokens.concat({ token });
  console.log('User tokens:', user.tokens);
  await user.save();
  res.json({ token });
});


router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
