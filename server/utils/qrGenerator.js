const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate unique QR code for order
 * @param {String} orderId - MongoDB order ID
 * @returns {Object} - QR code data URL and unique code
 */
const generateOrderQR = async (orderId) => {
    try {
        // Generate unique code
        const uniqueCode = `HDS-${uuidv4()}`;

        // QR data includes order ID and unique code
        const qrData = JSON.stringify({
            orderId: orderId.toString(),
            code: uniqueCode,
            timestamp: Date.now()
        });

        // Generate QR code as data URL
        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2
        });

        return {
            qrCode: uniqueCode,
            qrCodeDataURL,
            qrData
        };
    } catch (error) {
        console.error('QR generation error:', error);
        throw new Error('Failed to generate QR code');
    }
};

/**
 * Verify QR code data
 * @param {String} qrData - Scanned QR data
 * @returns {Object} - Parsed QR data
 */
const verifyQRCode = (qrData) => {
    try {
        const parsed = JSON.parse(qrData);

        // Check if QR code is not too old (24 hours)
        const ageInHours = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
        if (ageInHours > 24) {
            throw new Error('QR code expired');
        }

        return parsed;
    } catch (error) {
        console.error('QR verification error:', error);
        throw new Error('Invalid QR code');
    }
};

module.exports = { generateOrderQR, verifyQRCode };
