const crypto = require('crypto');

const decryptPayload = (req, res, next) => {

  // Skip processing for non-POST and non-PUT requests
  if (!['POST', 'PUT'].includes(req.method)) {
    return next();
  }

  try {

    const { data: encryptedData, cursorValue = false , iv } = req.body;

    if (!cursorValue) return next();

    const encryptedKey = Buffer.from(process.env.REACT_APP_ENCRYPTED_KEY, 'hex');
    const encryptedIv = Buffer.from(iv, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptedKey, encryptedIv);

    const decryptedData = decipher.update(encryptedData, 'hex', 'utf8') + decipher.final('utf8');
    req.body = JSON.parse(decryptedData);

    return next();
  } catch (error) {
    console.error('Decryption error:', error.message);
    return res.status(500).json({ message: 'Error decrypting payload' });
  }
};

module.exports = { decryptPayload };
