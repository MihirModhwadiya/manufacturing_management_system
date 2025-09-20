// Import Express framework and required middleware
import express from 'express'; // Web application framework
import mongoose from 'mongoose'; // MongoDB object modeling library
import cors from 'cors'; // Cross-Origin Resource Sharing middleware
import dotenv from 'dotenv'; // Environment variables loader
// Import route modules for different API endpoints
import authRoutes from './routes/auth.js'; // Authentication routes
import manufacturingOrderRoutes from './routes/manufacturingOrders.js'; // Manufacturing order routes
import workOrderRoutes from './routes/workOrders.js'; // Work order routes  
import bomRoutes from './routes/bom.js'; // Bill of Materials routes
import stockLedgerRoutes from './routes/stockLedger.js'; // Stock ledger routes
import workCenterRoutes from './routes/workCenters.js'; // Work center routes
import departmentRoutes from './routes/departments.js'; // Department routes
import profileReportRoutes from './routes/profileReports.js'; // Profile report routes
import exportRoutes from './routes/export.js'; // Data export routes
import dashboardRoutes from './routes/dashboard.js'; // Dashboard analytics routes
import materialRoutes from './routes/materials.js'; // Material management routes

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS configuration - allow all common frontend ports
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'http://localhost:8080',
    'http://localhost:8081',
    process.env.CLIENT_URL
  ].filter(Boolean), // Remove any undefined values
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// API Routes - Mount different route modules under specific paths
app.use('/api/auth', authRoutes); // Authentication and user management
app.use('/api/manufacturing-orders', manufacturingOrderRoutes); // Manufacturing order management
app.use('/api/work-orders', workOrderRoutes); // Work order management
app.use('/api/bom', bomRoutes); // Bill of Materials management
app.use('/api/stock-ledger', stockLedgerRoutes); // Stock movement tracking
app.use('/api/work-centers', workCenterRoutes); // Work center management
app.use('/api/departments', departmentRoutes); // Department management
app.use('/api/profile-reports', profileReportRoutes); // Profile report management
app.use('/api/export', exportRoutes); // Data export functionality
app.use('/api/dashboard', dashboardRoutes); // Dashboard analytics and KPIs
app.use('/api/materials', materialRoutes); // Material management

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'ManufactureERP API is running', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
