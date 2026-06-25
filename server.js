require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// 1. Basic Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// 3. API Routes
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const traineeRoutes = require('./routes/traineeRoutes');
const courseRoutes = require('./routes/courseRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const excelRoutes = require('./routes/excelRoutes');
const dataRoutes = require('./routes/dataRoutes');
const dynamicSheetRoutes = require('./routes/dynamicSheetRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/trainees', traineeRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/uploaded-sheets', dynamicSheetRoutes);
app.use('/api', dataRoutes);

// 4. Clean Frontend Routing
// Explicitly map clean URLs to their corresponding HTML files in the public directory
const frontendRoutes = {
    '/': 'index.html',
    '/dashboard': 'dashboard.html',
    '/login': 'login.html',
    '/register': 'register.html',
    '/clients': 'index.html',
    '/trainees': 'trainees.html',
    '/courses': 'courses.html',
    '/certificates': 'certificates.html',
    '/invoices': 'invoices.html',
    '/reports': 'reports.html',
    '/settings': 'settings.html',
    '/spreadsheets': 'spreadsheets.html'
};

Object.entries(frontendRoutes).forEach(([routePath, fileName]) => {
    app.get(routePath, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', fileName));
    });
});

// Fallback for any other unmatched frontend route to avoid "Cannot GET" errors
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 5. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running smoothly on port ${PORT}`);
});