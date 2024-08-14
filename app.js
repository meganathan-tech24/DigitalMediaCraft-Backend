const path = require('path');

const bodyParser = require('body-parser');
const express = require('express');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const mongoose = require('mongoose');
const morgan = require('morgan');
const favicon = require('serve-favicon');

require('dotenv').config();
const config = require('./common/config');
const { xssMiddleware } = require('./middleware/xssParse');
const apiRoutes = require('./routes/api.js');
const routeManager = require('./routes/manager');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(favicon(path.join(__dirname, 'public', 'calendar.png')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(morgan('dev')); // Log HTTP requests

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000
});

app.use(limiter);

// Session management
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: (process.env.NODE_ENV === 'production'), // Set to true in production for HTTPS
        httpOnly: true, // Ensures the cookie is not accessible via JavaScript
        maxAge: 1000 * 60 * 60 * 2, // 2 hours
    },
}));

// XSS protection
app.use(xssMiddleware);

// MongoDB connection options
if (process.env.MONGODB_DEBUG === 'true') {
    mongoose.set('debug', true);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, config.serverOptions)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Initialize API Router and Register Routes
(async () => {
    try {
        const v1Router = express.Router();
        await routeManager.register(v1Router, apiRoutes.v1);

        // Use API Router
        app.use('/api/v1', v1Router);
        app.use('/api', v1Router);

        // Catch 404 and forward to error handler
        app.use((req, res, next) => {
            console.log('404 error:', req.url);

            // Render the 404 template
            res.status(404).render('404', {
                title: 'Page Not Found',
                message: 'The page you are looking for does not exist.',
                path: req.url
            });
        });

        // Error handler for development
        app.use((err, req, res, next) => {
            if (app.get('env') === 'development') {
                console.error(err.stack);
                res.status(err.status || 500);
                res.json({ message: 'Something went wrong' , error : err.message });
            } else {
                next(err);
            }
        });

        // Error handler for production
        app.use((err, req, res, next) => {
            console.error(err.message); // Log only the error message in production
            res.status(err.status || 500);
            res.json({ message: 'Something went wrong' , error : err.message });
        });

        // Start server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Error initializing API:', error);
        process.exit(1); // Exit the process with failure code
    }
})();
