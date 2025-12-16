/**
 * Test Gmail SMTP Email Sending
 * 
 * Run with: node scripts/test-gmail-email.js
 */

require('dotenv').config({ path: '.env.local' });

const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🧪 Testing Gmail SMTP Email Service\n');
  
  // Check configuration
  console.log('📋 Configuration:');
  console.log('  EMAIL_HOST:', process.env.EMAIL_HOST || '❌ Not set');
  console.log('  EMAIL_PORT:', process.env.EMAIL_PORT || '❌ Not set');
  console.log('  EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set (' + process.env.EMAIL_USER + ')' : '❌ Not set');
  console.log('  EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set');
  console.log('  EMAIL_FROM:', process.env.EMAIL_FROM || '❌ Not set');
  console.log('');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Missing email credentials. Please set EMAIL_USER and EMAIL_PASSWORD in .env.local');
    process.exit(1);
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  console.log('🔌 Testing SMTP connection...');
  
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified!\n');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    process.exit(1);
  }

  // Send test email
  const testEmail = process.env.EMAIL_USER; // Send to self for testing
  
  console.log(`📧 Sending test email to: ${testEmail}`);
  
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `MASH <${process.env.EMAIL_USER}>`,
      to: testEmail,
      subject: '🍄 MASH Email Test - Gmail SMTP Working!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1E392A;">🍄 MASH Email Test</h1>
          <p>This is a test email from your MASH E-commerce platform.</p>
          <p>If you're reading this, your <strong>Gmail SMTP</strong> email service is working correctly!</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toISOString()}<br />
            From: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}
          </p>
        </div>
      `,
    });
    
    console.log('✅ Email sent successfully!');
    console.log('  Message ID:', info.messageId);
    console.log('\n🎉 Gmail SMTP is configured correctly!');
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    process.exit(1);
  }
}

testEmail();
