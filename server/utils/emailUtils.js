// server/utils/emailUtils.js
const nodemailer = require('nodemailer');
const config = require('../config/config');

// Create transporter
const transporter = nodemailer.createTransport({
  service: config.EMAIL_SERVICE,
  auth: {
    user: config.EMAIL_USERNAME,
    pass: config.EMAIL_PASSWORD
  }
});

// Send welcome email
const sendWelcomeEmail = async (name, email) => {
  try {
    const mailOptions = {
      from: config.EMAIL_FROM,
      to: email,
      subject: 'Welcome to FitZone!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Welcome to FitZone!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for joining FitZone! We're excited to have you as part of our fitness community.</p>
          <p>With your new account, you can:</p>
          <ul>
            <li>Book classes with our expert trainers</li>
            <li>Track your fitness progress</li>
            <li>Access exclusive workout tips and resources</li>
            <li>Join our community events</li>
          </ul>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>The FitZone Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Send booking confirmation email
const sendBookingConfirmationEmail = async (user, booking) => {
  try {
    const bookingType = booking.bookingType === 'class' ? 'Class' : 'Training Session';
    const bookingDetails = booking.bookingType === 'class' 
      ? `Class: ${booking.class.name} on ${new Date(booking.date).toLocaleDateString()} at ${booking.class.time}`
      : `Session with ${booking.trainer.name} on ${new Date(booking.date).toLocaleDateString()} at ${booking.time}`;
    
    const mailOptions = {
      from: config.EMAIL_FROM,
      to: user.email,
      subject: `FitZone - ${bookingType} Booking Confirmation`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Booking Confirmation</h2>
          <p>Hello ${user.name},</p>
          <p>Your ${bookingType.toLowerCase()} booking has been confirmed!</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Booking Details:</strong></p>
            <p style="margin: 10px 0;">${bookingDetails}</p>
            <p style="margin: 0;">Participants: ${booking.participants}</p>
          </div>
          <p>We look forward to seeing you!</p>
          <p>Best regards,<br>The FitZone Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendBookingConfirmationEmail
};
