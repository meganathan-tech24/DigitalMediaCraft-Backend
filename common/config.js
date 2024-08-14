
const config = {};

// MongoDB connection options
config.serverOptions = {
    maxPoolSize: 100,
    connectTimeoutMS: 470000,
    socketTimeoutMS: 470000
};

module.exports = config;
