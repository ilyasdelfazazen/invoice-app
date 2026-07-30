const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes        = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const clientRoutes      = require('./routes/clientRoutes');
const productRoutes     = require('./routes/productRoutes');
const invoiceRoutes     = require('./routes/invoiceRoutes');
const operationRoutes   = require('./routes/operationRoutes');
const errorHandler      = require('./middleware/errorHandler');
const { connectDB }     = require('./config/db');

const app = express();

app.use(helmet());
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://scemanager.online', 'https://www.scemanager.online', 'capacitor://localhost']
  : ['http://localhost:4200', 'http://localhost:8100', 'capacitor://localhost'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: true, limit: '3mb' }));

app.use('/api/auth',        authRoutes);
app.use('/api/application', applicationRoutes);
app.use('/api/clients',     clientRoutes);
app.use('/api/products',    productRoutes);
app.use('/api/invoices',    invoiceRoutes);
app.use('/api/operations',  operationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
