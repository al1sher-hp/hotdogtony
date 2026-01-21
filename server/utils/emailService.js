const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

/**
 * Send magic link email to customer
 * @param {String} email - Customer email
 * @param {String} token - Magic link token
 */
const sendMagicLink = async (email, token) => {
    const magicLink = `${process.env.CLIENT_URL}/verify-magic-link?token=${token}`;

    const mailOptions = {
        from: `"Hotdog Shahobcha" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Hotdog Shahobcha - Login Link',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌭 Hotdog Shahobcha</h1>
          </div>
          <div class="content">
            <h2>Assalomu alaykum!</h2>
            <p>Hotdog Shahobcha tizimiga kirish uchun quyidagi tugmani bosing:</p>
            <p style="text-align: center;">
              <a href="${magicLink}" class="button">Kirish</a>
            </p>
            <p>Yoki quyidagi linkni brauzeringizga nusxalang:</p>
            <p style="word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
              ${magicLink}
            </p>
            <p><strong>Eslatma:</strong> Bu link 15 daqiqa davomida amal qiladi.</p>
          </div>
          <div class="footer">
            <p>Agar siz bu emailni so'ramagan bo'lsangiz, e'tibor bermang.</p>
            <p>&copy; 2026 Hotdog Shahobcha. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </body>
      </html>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Magic link sent to:', email);
        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        throw new Error('Failed to send email');
    }
};

module.exports = { sendMagicLink };
