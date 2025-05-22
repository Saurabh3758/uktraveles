const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const Booking = require('./models/Booking');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Routes
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/services', (req, res) => {
  const services = [
    {
      name: "Kedarnath",
      img: "/images/kedarnath.jpg",
      desc: [
        "Located in the Garhwal Himalayan range.",
        "One of the Char Dham pilgrimage sites.",
        "Famous for Kedarnath Temple dedicated to Lord Shiva.",
        "Trek access from Gaurikund.",
        "Surrounded by snow-capped peaks.",
        "Spiritual aura and peaceful environment.",
        "Accessible via helicopter and trekking.",
        "Cool weather throughout the year.",
        "Nearby attractions include Vasuki Tal and Chorabari Tal.",
        "Best visited during May to October."
      ]
    },
    {
      name: "Nainital",
      img: "/images/nainital.jpg",
      desc: [
        "Popular hill station in Kumaon region.",
        "Known for Naini Lake and boating.",
        "Surrounded by mountains and forests.",
        "Mall Road for shopping and food.",
        "Naina Devi Temple attracts thousands.",
        "Ideal for families and couples.",
        "Snow View Point and Tiffin Top offer great views.",
        "Adventure activities available nearby.",
        "Cool climate and peaceful vibes.",
        "Accessible from major cities in North India."
      ]
    }
    // Add more destinations here
  ];
  res.render('services', { services });
});

app.get('/book', (req, res) => {
  res.render('book');
});

app.post('/book-ride', upload.fields([{ name: 'aadhaar' }, { name: 'photo' }]), async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      destination: req.body.destination,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      aadhaar: req.files['aadhaar'][0].filename,
      photo: req.files['photo'][0].filename
    };

    const newBooking = new Booking(data);
    await newBooking.save();

    res.send(`
      <h2>✅ Booking successful!</h2>
      <p>Thank you, ${data.name}. We'll contact you soon.</p>
      <a href="/">Back to Home</a>
    `);
  } catch (err) {
    console.error("❌ Error saving booking:", err);
    res.status(500).send("Something went wrong. Please try again.");
  }
});

app.get('/admin', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.render('admin', { bookings });
  } catch (err) {
    console.error("Error loading admin panel:", err);
    res.status(500).send("Unable to load admin panel.");
  }
});

app.get('/bikeonrent', (req, res) => {
  res.render('bikeonrent');
});

app.get('/home', (req, res) => {
  res.render('home');
});

<<<<<<< HEAD
app.get('/about', (req, res) => {
  res.render('about');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
=======
// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
>>>>>>> 47cdf3e6c7e4c55e06d2ecd0e360b111012942b7
});
