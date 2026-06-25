const express = require('express');
const path = require('path');
const cors = require('cors');

// Import Routes
const companyRoutes = require('./routes/companyRoutes');
const traineeRoutes = require('./routes/traineeRoutes');
const courseRoutes = require('./routes/courseRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const excelRoutes = require('./routes/excelRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/companies', companyRoutes);
app.use('/api/trainees', traineeRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/excel', excelRoutes);

// Page Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'clients.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/clients', (req, res) => res.sendFile(path.join(__dirname, 'public', 'clients.html')));
app.get('/trainees', (req, res) => res.sendFile(path.join(__dirname, 'public', 'trainees.html')));
app.get('/courses', (req, res) => res.sendFile(path.join(__dirname, 'public', 'courses.html')));
app.get('/certificates', (req, res) => res.sendFile(path.join(__dirname, 'public', 'certificates.html')));
app.get('/invoices', (req, res) => res.sendFile(path.join(__dirname, 'public', 'invoices.html')));
app.get('/reports', (req, res) => res.sendFile(path.join(__dirname, 'public', 'reports.html')));
app.get('/settings', (req, res) => res.sendFile(path.join(__dirname, 'public', 'settings.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`🏢 Clients: http://localhost:${PORT}/clients`);
    console.log(`👨‍🎓 Trainees: http://localhost:${PORT}/trainees`);
    console.log(`📚 Courses: http://localhost:${PORT}/courses`);
});