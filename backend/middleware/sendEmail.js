// utils/sendVerificationEmail.js (consider renaming the file too)

const nodemailer = require("nodemailer");
require("dotenv").config(); // Ensure .env is loaded in your main application entry point

// --- HTML Email Template Embedded as a String ---
// Using backticks (`) for easier multi-line string definition
const verificationEmailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DocuLingua Verification Code</title>
    <style>
        /* Basic Reset */
        body, html { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; background-color: #f4f7f6; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0; }
        .header { background-color: #4a90e2; /* Doculingua Blue - Adjust if needed */ color: #ffffff; padding: 25px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 30px 40px; color: #333333; }
        .content p { margin-bottom: 20px; font-size: 16px; }
        .verification-code { background-color: #e8f0fe; /* Light blue background */ color: #1a73e8; /* Darker blue text */ font-size: 32px; font-weight: bold; padding: 15px 25px; display: inline-block; border-radius: 6px; margin: 15px 0; letter-spacing: 3px; border: 1px dashed #a8c7fa; }
        .instructions { font-size: 14px; color: #555555; }
        .footer { background-color: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #e9ecef; }
        .footer p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Doculingua</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>Thank you for using Doculingua. Please use the following verification code to complete your action:</p>

            <div style="text-align: center;"> <span class="verification-code">{{CODE}}</span>
            </div>

            <p class="instructions">Enter this code in the app or on the website. This code is valid for 10 minutes.</p>
            <p class="instructions">If you did not request this code, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} DocuLingua. All rights reserved.</p>
            <p>Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;
// --- End Embedded Template ---

/**
 * Sends a verification code email using Gmail via Nodemailer.
 * @param {string} recipientEmail - The email address of the recipient.
 * @param {string} verificationCode - The verification code to include in the email.
 * @returns {Promise<boolean>} - True if email was sent successfully, false otherwise.
 */
const sendVerificationEmail = async (recipientEmail, verificationCode) => {
  // Validate essential environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error(
      "Error: EMAIL_USER or EMAIL_PASS environment variables are not set."
    );
    return false; // Indicate failure
  }

  // Validate input
  if (!recipientEmail || !verificationCode) {
    console.error("Error: Recipient email or verification code missing.");
    return false;
  }

  try {
    // Configure Nodemailer transporter using 'service: gmail'
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your Gmail App Password
      },
    });

    // --- Prepare Email Content ---
    const subject = "DocuLingua account verification code"; // Fixed subject
    // Inject the code into the HTML template
    const htmlContent = verificationEmailTemplate.replace(
      "{{CODE}}",
      verificationCode
    );
    // Create a simple plain text version as a fallback
    const textContent = `Hello,\n\nYour DocuLingua verification code is: ${verificationCode}\n\nEnter this code in the app. It's valid for 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nThanks,\nThe DocuLingua Team`;
    // --- End Prepare Email Content ---

    // Define mail options
    const mailOptions = {
      from: `"Doculingua" <${process.env.EMAIL_USER}>`, // Sender name and address
      to: recipientEmail,
      subject: subject,
      html: htmlContent, // Use the generated HTML
      text: textContent, // Use the generated text fallback
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    console.log(`Verification email sent successfully to ${recipientEmail}`);
    return true; // Indicate success
  } catch (error) {
    console.error(
      `Error sending verification email to ${recipientEmail}:`,
      error
    );
    return false; // Indicate failure
  }
};

module.exports = sendVerificationEmail; // Export the specific function
