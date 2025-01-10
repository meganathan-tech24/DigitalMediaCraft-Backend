const crypto = require('crypto');

// Middleware to encrypt response data for specific APIs
const encryptResponse = (req, res, next) => {
    const originalSend = res.send;

    // Override the res.send method to encrypt the response data
    res.send = function (body) {
        try {

            // Prepare encryption
            const key = Buffer.from(process.env.REACT_APP_ENCRYPTED_KEY, 'hex');
            const iv = Buffer.from(crypto.randomBytes(16), 'hex');
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

            // Encrypt the response body
            const encryptedData = cipher.update(JSON.stringify(body), 'utf8', 'hex') + cipher.final('hex');

            // Create and send encrypted response
            const encryptedResponse = { data: encryptedData, cursorValue: true , iv : iv.toString('hex')};
            const responseData = JSON.stringify(encryptedResponse);

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Length', Buffer.byteLength(responseData, 'utf8'));
            return originalSend.call(res, responseData);
        } catch (error) {
            // Handle encryption errors gracefully
            console.error('Encryption error:', error.message);
            return originalSend.call(res, JSON.stringify({ message: 'Encryption failed' }), 500);
        }
    };

    next();
};

module.exports = { encryptResponse };
