// SocialSpot Backend API - Complete Server
// File: server.js

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/socialspot', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Database Schemas

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  avatar: {
    type: String,
    default: function() {
      return this.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  district: {
    type: String,
    default: ''
  },
  interests: [{
    type: String,
    enum: ['aperitivi', 'cinema', 'sport', 'cultura', 'cucina', 'musica', 'arte', 'natura', 'tecnologia', 'libri']
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [9.1900, 45.4642] // Milano default
    }
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  eventsCreated: {
    type: Number,
    default: 0
  },
  eventsJoined: {
    type: Number,
    default: 0
  },
  friends: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geospatial queries
userSchema.index({ location: '2dsphere' });
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

// Event Schema
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['aperitivo', 'cinema', 'sport', 'cultura']
  },
  location: {
    name: {
      type: String,
      required: [true, 'Location name is required']
    },
    address: {
      type: String,
      default: ''
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Coordinates are required']
    }
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:MM format']
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Max participants is required'],
    min: [2, 'Minimum 2 participants required'],
    max: [100, 'Maximum 100 participants allowed']
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isOrganizer: {
      type: Boolean,
      default: false
    }
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: String,
    default: 'Gratuito'
  },
  ageRange: {
    type: String,
    default: 'Tutti'
  },
  tags: [{
    type: String,
    maxlength: 20
  }],
  photos: [{
    url: String,
    caption: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  weatherFriendly: {
    type: Boolean,
    default: true
  },
  accessibility: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed', 'full'],
    default: 'active'
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
eventSchema.index({ 'location.coordinates': '2dsphere' });
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ organizer: 1 });

// Virtual for current participants count
eventSchema.virtual('currentParticipants').get(function() {
  return this.participants.length;
});

// Update status when full
eventSchema.pre('save', function(next) {
  if (this.participants.length >= this.maxParticipants) {
    this.status = 'full';
  } else if (this.status === 'full' && this.participants.length < this.maxParticipants) {
    this.status = 'active';
  }
  next();
});

const Event = mongoose.model('Event', eventSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['text', 'image', 'location', 'system'],
    default: 'text'
  },
  attachments: [{
    type: String, // URLs to attached files
    filename: String,
    size: Number
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

messageSchema.index({ event: 1, createdAt: 1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model('Message', messageSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['event_reminder', 'new_message', 'event_update', 'join_confirmed', 'event_created', 'event_cancelled', 'friend_request'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  relatedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

// Middleware Functions

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication error' });
  }
};

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Max 5 files per request
  },
  fileFilter: fileFilter
});

// Helper Functions

// Calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

// Create notification helper
const createNotification = async (userId, type, title, message, eventId = null, userData = {}) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      relatedEvent: eventId,
      data: userData
    });
    await notification.save();
    
    // Emit to user via socket if connected
    io.to(`user_${userId}`).emit('new_notification', notification);
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Format user response
const formatUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    city: user.city,
    district: user.district,
    interests: user.interests,
    rating: user.rating,
    eventsCreated: user.eventsCreated,
    eventsJoined: user.eventsJoined,
    friends: user.friends,
    joinedAt: user.joinedAt
  };
};

// Format event response
const formatEventResponse = (event, userLat = null, userLng = null) => {
  let distance = null;
  if (userLat && userLng && event.location.coordinates) {
    distance = calculateDistance(
      userLat, 
      userLng,
      event.location.coordinates[1], 
      event.location.coordinates[0]
    );
  }

  return {
    id: event._id,
    title: event.title,
    description: event.description,
    category: event.category,
    location: event.location,
    date: event.date,
    time: event.time,
    maxParticipants: event.maxParticipants,
    currentParticipants: event.participants.length,
    organizer: event.organizer,
    participants: event.participants,
    price: event.price,
    ageRange: event.ageRange,
    tags: event.tags,
    rating: event.rating,
    distance: distance ? `${distance} km` : null,
    photos: event.photos,
    weatherFriendly: event.weatherFriendly,
    accessibility: event.accessibility,
    status: event.status,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt
  };
};

// API ROUTES

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// AUTHENTICATION ROUTES

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, city, district, interests, coordinates } = req.body;

    // Validation
    if (!name || !email || !password || !city) {
      return res.status(400).json({ 
        error: 'Required fields missing',
        details: 'Name, email, password, and city are required'
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      city: city.trim(),
      district: district?.trim() || '',
      interests: interests || [],
      location: {
        coordinates: coordinates || [9.1900, 45.4642] // Milano default
      }
    });

    await user.save();

    // Generate JWT
    const token = generateToken(user._id);

    // Welcome notification
    await createNotification(
      user._id,
      'event_created',
      'Benvenuto su SocialSpot! 🎉',
      'Inizia a esplorare eventi nella tua zona e conosci nuove persone!'
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors 
      });
    }
    
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account has been deactivated' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    res.json({ 
      user: formatUserResponse(req.user)
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

// Update user profile
app.patch('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, city, district, interests, coordinates } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (city) updateData.city = city.trim();
    if (district !== undefined) updateData.district = district.trim();
    if (interests) updateData.interests = interests;
    if (coordinates) updateData['location.coordinates'] = coordinates;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors 
      });
    }
    
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// EVENT ROUTES

// Get events with filters and pagination
app.get('/api/events', authenticateToken, async (req, res) => {
  try {
    const { 
      category, 
      search, 
      lat, 
      lng, 
      radius = 50, // km
      page = 1, 
      limit = 20,
      sortBy = 'date',
      status = 'active'
    } = req.query;

    // Build query
    let query = { 
      status: status,
      date: { $gte: new Date() }
    };

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { 'location.name': searchRegex },
        { 'location.address': searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    // Geolocation filter
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      if (!isNaN(userLat) && !isNaN(userLng)) {
        query['location.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [userLng, userLat]
            },
            $maxDistance: radius * 1000 // Convert km to meters
          }
        };
      }
    }

    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'date':
        sortOptions = { date: 1, time: 1 };
        break;
      case 'distance':
        // Distance sorting is handled by $near in geolocation query
        sortOptions = { createdAt: -1 };
        break;
      case 'popular':
        // Sort by number of participants
        sortOptions = { 'participants.length': -1, date: 1 };
        break;
      case 'rating':
        sortOptions = { rating: -1, date: 1 };
        break;
      case 'recent':
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { date: 1, time: 1 };
    }

    // Execute query
    const events = await Event.find(query)
      .populate('organizer', 'name avatar rating')
      .populate('participants.user', 'name avatar')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalEvents = await Event.countDocuments(query);

    // Format events with distance calculation
    const formattedEvents = events.map(event => 
      formatEventResponse(event, lat ? parseFloat(lat) : null, lng ? parseFloat(lng) : null)
    );

    res.json({
      events: formattedEvents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalEvents,
        pages: Math.ceil(totalEvents / parseInt(limit))
      },
      filters: {
        category,
        search,
        location: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null,
        radius: parseInt(radius),
        sortBy
      }
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Create new event
app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      location, 
      date, 
      time, 
      maxParticipants,
      price,
      ageRange,
      tags,
      weatherFriendly,
      accessibility
    } = req.body;

    // Validation
    if (!title || !description || !category || !location || !date || !time || !maxParticipants) {
      return res.status(400).json({ 
        error: 'Required fields missing',
        details: 'Title, description, category, location, date, time, and maxParticipants are required'
      });
    }

    // Validate date is in the future
    const eventDate = new Date(`${date} ${time}`);
    if (eventDate <= new Date()) {
      return res.status(400).json({ error: 'Event date must be in the future' });
    }

    // Default coordinates to Milano if not provided
    const coordinates = location.coordinates || [9.1900, 45.4642];

    const event = new Event({
      title: title.trim(),
      description: description.trim(),
      category,
      location: {
        name: location.name.trim(),
        address: location.address?.trim() || '',
        coordinates
      },
      date: eventDate,
      time,
      maxParticipants: parseInt(maxParticipants),
      organizer: req.user._id,
      participants: [{
        user: req.user._id,
        isOrganizer: true
      }],
      price: price?.trim() || 'Gratuito',
      ageRange: ageRange?.trim() || 'Tutti',
      tags: tags || [],
      weatherFriendly: weatherFriendly !== false,
      accessibility: accessibility !== false
    });

    await event.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { eventsCreated: 1 }
    });

    // Create notification
    await createNotification(
      req.user._id,
      'event_created',
      'Evento pubblicato! 🎉',
      `"${title}" è ora visibile a tutti gli utenti`,
      event._id
    );

    // Populate and return
    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name avatar rating')
      .populate('participants.user', 'name avatar')
      .lean();

    res.status(201).json({
      message: 'Event created successfully',
      event: formatEventResponse(populatedEvent)
    });

  } catch (error) {
    console.error('Create event error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors 
      });
    }
    
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Get single event details
app.get('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid event ID'
