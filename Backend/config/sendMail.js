const nodemailer = require('nodemailer');
require('dotenv').config();

exports.sendResetEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    });

    const info = await transporter.sendMail({
      from: '"CoursiFY" <onboarding@resend.dev>',
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It expires in 10 minutes.`,
      html: `<b>Your OTP for password reset is ${otp}</b><p>It expires in 10 minutes.</p>`,
    });

    console.log("Email Sent:", info.messageId);
  } catch (error) {
    console.error("Mail Error:", error.message);
  }
};