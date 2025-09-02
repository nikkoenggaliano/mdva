'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { pool } = require('./config/db');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { authMiddleware } = require('./middleware/auth');
const { accessLogger, backgroundLog } = require('./middleware/logger');

const authRoutes = require('./routes/auth');
// User-scoped routes
const userEventsRoutes = require('./routes/user/events');
const userUsersRoutes = require('./routes/user/users');
const userInventoryRoutes = require('./routes/user/inventory');
const userLeaveRoutes = require('./routes/user/leave');
const leaveRoutes = require('./routes/leave');
const userLeavesRoutes = require('./routes/user/leaves');
const messagesRoutes = require('./routes/messages');
const userNotificationsRoutes = require('./routes/user/notifications');
const notificationRoutes = require('./routes/notification');
const profileRoutes = require('./routes/profile');
// Admin routes
const adminIndexRoutes = require('./routes/admin/index');
const adminUsersRoutes = require('./routes/admin/users');
const adminMessagesRoutes = require('./routes/admin/messages');
const adminLeaveRequestsRoutes = require('./routes/admin/leaveRequests');
const adminApprovalLeavesRoutes = require('./routes/admin/approvalLeaves');
// HRD routes
const hrdRoutes = require('./routes/hrd');
const hrdLeavesRoutes = require('./routes/hrd/leaves');
const hrdApprovalLeavesRoutes = require('./routes/hrd/approvalLeaves');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(accessLogger);

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const uploadsMessagesDir = path.join(uploadsDir, 'messages');
if (!fs.existsSync(uploadsMessagesDir)) {
  fs.mkdirSync(uploadsMessagesDir, { recursive: true });
}
const uploadsProfileDir = path.join(uploadsDir, 'profile');
if (!fs.existsSync(uploadsProfileDir)) {
  fs.mkdirSync(uploadsProfileDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

app.get('/', async (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'production', message: 'MDVA backend is running', author: "Nikko Enggaliano", blog: "https://nikko.id" });
});

app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await pool.promise().query('SELECT 1')
      .then(() => ({ connected: true, message: 'Database connected' }))
      .catch(err => ({ connected: false, message: `Database error: ${err.message}` }));

    res.json({
      ok: true,
      env: process.env.NODE_ENV || 'production',
      server: {
        status: 'running',
        uptime: Math.floor(process.uptime()) + '  seconds',
        timestamp: new Date().toISOString(),
        pid: process.pid
      },
      usage: {
        cpu: process.cpuUsage(),
        memory: process.memoryUsage()
      },
      database: dbStatus
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Public routes
app.use('/api/auth', authRoutes);

// Authenticated routes (token validity only)
app.use('/api', authMiddleware);
// User routes
app.use('/api/events', userEventsRoutes);
app.use('/api/users', userUsersRoutes);
app.use('/api/inventory', userInventoryRoutes);
app.use('/api/leave', userLeaveRoutes);
app.use('/api/leaves', userLeavesRoutes);
// Global leave routes for all roles
app.use('/api/leave', leaveRoutes);
app.use('/api/leaves', userLeavesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/notifications', userNotificationsRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/profile', profileRoutes);
// Admin routes
app.use('/api/admin', adminIndexRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/messages', adminMessagesRoutes);
app.use('/api/admin/leaves', adminLeaveRequestsRoutes);
app.use('/api/admin/leave-requests', adminLeaveRequestsRoutes);
app.use('/api/admin/approval-leaves', adminApprovalLeavesRoutes);
// HRD routes (placeholder)
app.use('/api/hrd', hrdRoutes);
app.use('/api/hrd/leaves', hrdLeavesRoutes);
app.use('/api/hrd/approval-leaves', hrdApprovalLeavesRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MDVA backend listening on port ${PORT}`);
});


