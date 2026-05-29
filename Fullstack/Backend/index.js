import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';



// Allow all origins to talk to your backend API


const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
dotenv.config();

app.use(express.json()); 

// Connect to Database
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('🔌 Connected securely to the MongoDB database.'))
  .catch((err) => console.log('❌ Database connection failed.'));

// ================= SCHEMAS & MODELS =================
// ================= ADD THIS TO SECTION #4 (SCHEMAS & MODELS) =================

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: String,
      price: Number,
      image: String,
      category: String,
      quantity: { type: Number, default: 1 }
    }
  ]
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);


// ================= ADD THIS TO SECTION #5 (ROUTES) =================

// Route C: Sync/Save items to a User's Cloud Cart (Protected Route)
app.post('/api/cart', async (req, res) => {
  try {
    // 1. Check for the security token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Please log in to save items to your cart.' });

    // 2. Decode the token to get the logged-in User's ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { productId, name, price, image, category } = req.body;

    // 3. Find the user's cart or create a brand new one if it doesn't exist yet
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // 4. Check if the item is already in the cart
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      // If item exists, bump up the quantity counter
      cart.items[itemIndex].quantity += 1;
    } else {
      // If it's a new item, push the whole product object into the array
      cart.items.push({ productId, name, price, image, category, quantity: 1 });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update cloud cart', error: error.message });
  }
});

// Route D: Fetch a User's Saved Cart when they log in (Protected Route)
app.get('/api/cart', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const cart = await Cart.findOne({ userId: decoded.id });
    res.status(200).json(cart ? cart.items : []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to pull cloud cart data', error: error.message });
  }
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  price: Number,
  rating: Number,
  image: String,
  tag: String
});
const Product = mongoose.model('Product', productSchema);

// User Schema (Stores accounts)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false } // Determines admin privileges
});
const User = mongoose.model('User', userSchema);


// ================= AUTHENTICATION ROUTES =================

// Route 1: Register a New User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) return res.status(400).json({ message: 'Username or Email already taken' });

    // Securely hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false // Pass true from registration data to manually create first admin
    });

    await newUser.save();
    res.status(201).json({ message: 'Account successfully registered!' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Route 2: Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Create a login token valid for 24 hours
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});


// ================= HARDWARE STORE ROUTES =================

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Secure Admin Only Route to Create Products
app.post('/api/products', async (req, res) => {
  try {
    // Read user token from authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    // Decode and verify the user token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) return res.status(403).json({ message: 'Access denied. Admins only.' });

    // If verified admin, save product to database
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Failed to insert product', error: error.message });
  }
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});