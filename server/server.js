require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const cron = require('node-cron');

// Import routes
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const menuRoutes = require('./routes/menu');
const userRoutes = require('./routes/users');
const ingredientRoutes = require('./routes/ingredients');
const feedbackRoutes = require('./routes/feedback');
const reportRoutes = require('./routes/reports');

// Import models
const Order = require('./models/Order');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
});

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Hotdog Shahobcha Server is running',
        timestamp: new Date().toISOString()
    });
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join display room for screen updates
    socket.on('joinDisplay', () => {
        socket.join('display');
        console.log('Display screen joined');
    });

    // Join employee room
    socket.on('joinEmployee', () => {
        socket.join('employee');
        console.log('Employee joined');
    });

    // Join customer room with order ID
    socket.on('joinOrder', (orderId) => {
        socket.join(`order:${orderId}`);
        console.log(`Customer joined order: ${orderId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        // FORCE SYNC INDEXES (Fixes the "Username/Email already exists" ghost issue)
        try {
            const User = require('./models/User');
            // Check if collection exists before dropping
            const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
            if (collections.length > 0) {
                console.log('🔄 Cleaning legacy database indexes...');
                await User.collection.dropIndexes();
                console.log('✅ Database indexes synchronized');
            }
        } catch (e) {
            console.log('ℹ️ Index sync info:', e.message);
        }

        // Initialize default users
        initializeSuperAdmin();
        initializeBoss();
        initializeEmployee();

        // Initialize default menu items
        initializeDefaultMenu();
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// Initialize super-admin
const initializeSuperAdmin = async () => {
    const User = require('./models/User');
    const adminEmail = 'admin@hotdog.uz';

    try {
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            console.log('🚀 Creating default Super Admin...');
            const defaultAdmin = new User({
                name: 'Super Admin',
                email: adminEmail,
                password: 'admin123',
                role: 'super-admin'
            });

            await defaultAdmin.save();
            console.log(`✅ Super Admin created!`);
        } else {
            console.log('ℹ️ Super Admin already exists:', adminEmail);
        }
    } catch (error) {
        console.error('❌ Error initializing super admin:', error);
    }
};

// Initialize boss
const initializeBoss = async () => {
    const User = require('./models/User');
    const bossEmail = 'boss@hotdog.uz';

    try {
        const existingBoss = await User.findOne({ email: bossEmail });
        if (!existingBoss) {
            console.log('🚀 Creating default Boss...');
            const defaultBoss = new User({
                name: 'Hotdog Boss',
                email: bossEmail,
                password: 'boss123',
                role: 'boss'
            });
            await defaultBoss.save();
            console.log(`✅ Boss created! (${bossEmail} / boss123)`);
        }
    } catch (error) {
        console.error('❌ Error initializing boss:', error);
    }
};

// Initialize employee
const initializeEmployee = async () => {
    const User = require('./models/User');
    const empEmail = 'zohid@hotdog.uz';

    try {
        const existingEmp = await User.findOne({ email: empEmail });
        if (!existingEmp) {
            console.log('🚀 Creating default Employee...');
            const defaultEmp = new User({
                name: 'Zohid Hodim',
                email: empEmail,
                password: 'staff123',
                role: 'employee'
            });
            await defaultEmp.save();
            console.log(`✅ Employee created! (${empEmail} / staff123)`);
        }
    } catch (error) {
        console.error('❌ Error initializing employee:', error);
    }
};

// Initialize default menu items (for demo)
const initializeDefaultMenu = async () => {
    const MenuItem = require('./models/MenuItem');

    try {
        const menuCount = await MenuItem.countDocuments();

        if (menuCount === 0) {
            const defaultItems = [
                {
                    name: 'Classic Hot Dog',
                    description: 'Traditional hot dog with ketchup and mustard',
                    price: 15000,
                    category: 'classic',
                    image: 'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Classic+Hot+Dog',
                    available: true
                },
                {
                    name: 'Cheese Hot Dog',
                    description: 'Hot dog with melted cheese',
                    price: 18000,
                    category: 'classic',
                    image: 'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Cheese+Hot+Dog',
                    available: true
                },
                {
                    name: 'Premium Deluxe',
                    description: 'Premium hot dog with special sauce and toppings',
                    price: 25000,
                    category: 'premium',
                    image: 'https://via.placeholder.com/400x300/95E1D3/FFFFFF?text=Premium+Deluxe',
                    available: true
                },
                {
                    name: 'Combo Meal',
                    description: 'Hot dog + French fries + Drink',
                    price: 30000,
                    category: 'combo',
                    image: 'https://via.placeholder.com/400x300/F38181/FFFFFF?text=Combo+Meal',
                    available: true
                },
                {
                    name: 'Cola',
                    description: 'Refreshing cold cola',
                    price: 5000,
                    category: 'drinks',
                    image: 'https://via.placeholder.com/400x300/AA96DA/FFFFFF?text=Cola',
                    available: true
                }
            ];

            await MenuItem.insertMany(defaultItems);
            console.log('✅ Default menu items created');
        }
    } catch (error) {
        console.error('Error initializing menu:', error);
    }
};

// Cron job: Reset daily order numbers at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Resetting daily order numbers...');
    // Daily numbers are automatically handled by counting orders from today
    // This is just a log reminder
    console.log('✅ Daily reset complete');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});

module.exports = { app, io };
