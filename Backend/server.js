// Step 1: Load required packages
console.log(' Step 1: Requiring packages');
const express = require('express');          // Web framework for creating APIs
const cors = require('cors');                // Enables Cross-Origin Resource Sharing
const mongoose = require('mongoose');        // ODM library to work with MongoDB
require('dotenv').config();                  // Loads environment variables from .env file
const bcrypt = require('bcryptjs');          // Used to hash and compare passwords securely
const User = require('./models/user');       // User schema/model

//This sets up Express app
console.log(' Step 2: Setting up Express app');
const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000; //defines port number

// Middleware
console.log(' Step 3: Adding middleware');
app.use(express.json());    // Automatically parse incoming JSON requests

// Tests the route to verify if the server is running
console.log(' Step 4: Defining routes');
app.get('/', (req, res) => {
  res.send('MDX Events Booking API is running ');
});

// Connects to MongoDB using the connection string from .env 
console.log(' Step 5: Connecting to MongoDB...');
console.log(' Mongo URI:', process.env.MONGO_URI); // helpful for debugging
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log(' MongoDB connected');
})
.catch((err) => {
  console.error(' MongoDB connection error:', err);
  process.exit(1); // stop server if DB doesn't connect
});

// Starts the express server on the this port
console.log(' Step 6: Starting server...');
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});

// Imports Mongoose models for bookings and events
const Booking = require('./models/booking');
const Event = require('./models/event'); 




//POST endpoint for user registration
app.post('/api/register', async (req, res) => {
  try {

    // Extract fields from request body
    const { email, username, password, phone, universityId, gender } = req.body;

    //  Check individual fields for uniqueness
    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ error: "Email already in use" });

    const usernameExists = await User.findOne({ username });
    if (usernameExists) return res.status(400).json({ error: "Username already in use" });

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) return res.status(400).json({ error: "Phone number already in use" });

    const uniIdExists = await User.findOne({ universityId });
    if (uniIdExists) return res.status(400).json({ error: "University ID already in use" });

    // Encrypts the user password
    const hashedPassword = await bcrypt.hash(password, 10);

    //  Create and save new user
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      phone,
      universityId,
      gender,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error(' Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});


//  Post endpoint for User login
app.post('/api/login', async (req, res) => {
  try {

// Find the user by email or username
    const { emailOrUsername, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

// Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

// Send user data on successful login
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error(' Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Post endpoint for booking
app.post('/api/book', async (req, res) => {
  try {
    const { username, email, event } = req.body;

// Create a new booking entry
    const newBooking = new Booking({
      name: username,
      email,
      eventType: event,
      eventDate: new Date(), // You can customize this if needed
      notes: "Booked via frontend"
    });

// Save booking to database
    await newBooking.save();
    res.status(201).json({ message: "Booking saved successfully!" });
  } catch (err) {
    console.error(" Booking error:", err);
    res.status(500).json({ error: "Failed to save booking" });
  }
});

//  Fetch bookings for a specific user 
app.get('/api/bookings/:email', async (req, res) => {
  try {
    const email = req.params.email;

// Find all bookings associated with the email
    const bookings = await Booking.find({ email });
    res.status(200).json(bookings);
  } catch (error) {
    console.error(' Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
});

//Delete , cancel user booking 
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;

// Find and delete booking
    await Booking.findByIdAndDelete(bookingId);
    res.status(200).json({ message: "Booking cancelled" });
  } catch (error) {
    console.error(" Error cancelling booking:", error);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});


// POST endpoint to create a new event

app.post('/api/events', async (req, res) => {
  try {
    console.log(" Incoming event data:", req.body); //  Debug log

    const { title, description, date, createdBy } = req.body;

    // Check for missing fields
    if (!title || !date || !createdBy) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newEvent = new Event({ title, description, date, createdBy });
    const saved = await newEvent.save();

    res.status(201).json(saved);
  } catch (err) {
    console.error(" Error creating event:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// GET all events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (err) {
    console.error("Failed to fetch events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});