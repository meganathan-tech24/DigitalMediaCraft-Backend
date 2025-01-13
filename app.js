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
const OAuth = require('./middleware/OAuth.js');
const { xssMiddleware } = require('./middleware/xssParse');
const apiRoutes = require('./routes/api.js');
const routeManager = require('./routes/manager');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, config.serverOptions)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware for CORS headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('X-Frame-Options', 'SAMEORIGIN');
    next();
});

// Other middlewares
app.use(favicon(path.join(__dirname, 'public', 'social-media-marketing.png')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true, parameterLimit: 10000000 }));
app.use(morgan('dev'));

// View engine setup
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

// Initialize Express app
const oauth = new OAuth();
app.use('/api/*', oauth.authorize.bind(oauth));

// Initialize API Router and Register Routes
(async () => {
    try {
        const v1Router = express.Router();
        await routeManager.register(v1Router, apiRoutes.v1);

        app.use('/oauth', require('./controllers/oauthUserController').router);
        app.use('/api', v1Router);

        // Catch 404 and forward to error handler
        app.use((req, res, next) => {
            console.log('404 error:', req.url);
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
                res.json({ message: 'Something went wrong', error: err.message });
            } else {
                next(err);
            }
        });

        // Error handler for production
        app.use((err, req, res, next) => {
            console.error(err.message); // Log only the error message in production
            res.status(err.status || 500);
            res.json({ message: 'Something went wrong', error: err.message });
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
