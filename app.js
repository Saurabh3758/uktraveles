require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ✅ Mongoose Model
const appointmentSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  service: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const Appointment = mongoose.model('Appointment', appointmentSchema);

// ✅ Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Routes

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/appointment', (req, res) => {
  res.render('appointment');
});

app.post('/submit-appointment', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    // Format phone with +91 if not already
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
      formattedPhone = '+91' + phone;
    }

    const newAppointment = new Appointment({
      name,
      email,
      phone: formattedPhone,
      service,
      message
    });

    await newAppointment.save();
    res.render('success', { name });
  } catch (err) {
    console.error('Submission Error:', err);
    res.status(500).send('Error submitting appointment');
  }
});

app.get('/admin', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.render('admin', { appointments });
  } catch (err) {
    console.error('Admin Load Error:', err);
    res.status(500).send('Error loading admin panel');
  }
});

app.post('/delete/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    console.error('Delete Error:', err);
    res.status(500).send('Failed to delete appointment');
  }
});

app.post('/reply/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).send('Appointment not found');

    const replyMessage = req.body.message;

    if (
      !process.env.EMAIL || !process.env.EMAIL_PASS ||
      !process.env.TWILIO_SID || !process.env.TWILIO_AUTH || !process.env.TWILIO_PHONE
    ) {
      return res.status(500).send('Server config error: Missing environment variables');
    }

    // ✅ Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"IT Services" <${process.env.EMAIL}>`,
      to: appointment.email,
      subject: 'Reply to your appointment request',
      text: replyMessage
    });

    // ✅ Send SMS
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

    let toPhone = appointment.phone;
    if (!toPhone.startsWith('+')) {
      toPhone = '+91' + toPhone;
    }

    await client.messages.create({
      body: replyMessage,
      from: process.env.TWILIO_PHONE,
      to: toPhone
    });

    res.redirect('/admin');
  } catch (err) {
    console.error('Reply Error:', err);
    res.status(500).send('Internal Server Error: ' + err.message);
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
