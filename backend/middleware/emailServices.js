// utils/emailService.js
const nodemailer = require("nodemailer");
require("dotenv").config(); // Ensure .env is loaded

// --- Flexible HTML Email Template ---
// Added placeholders: {{GREETING}}, {{MAIN_MESSAGE}}, {{SECONDARY_MESSAGE}}, {{CALL_TO_ACTION}} (optional)
const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{SUBJECT}}</title> <style>
        /* Basic Reset */
        body, html { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; background-color: #f4f7f6; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0; }
        .header { background-color: #4a90e2; /* Doculingua Blue */ color: #ffffff; padding: 25px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 30px 40px; color: #333333; }
        .content p { margin-bottom: 20px; font-size: 16px; }
        .highlight { /* Style for OTP or important info */ background-color: #e8f0fe; color: #1a73e8; font-size: 24px; font-weight: bold; padding: 10px 20px; display: inline-block; border-radius: 6px; margin: 10px 0; letter-spacing: 2px; border: 1px dashed #a8c7fa; text-align: center; }
        .instructions { font-size: 14px; color: #555555; }
        .footer { background-color: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #e9ecef; }
        .footer p { margin: 5px 0; }
        .center-text { text-align: center; } /* Utility class */
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DocuLingua</h1>
        </div>
        <div class="content">
            <p>{{GREETING}}</p>
            <p>{{MAIN_MESSAGE}}</p>
            {{#if HIGHLIGHT_CONTENT}}
            <div class="center-text">
                 <span class="highlight">{{HIGHLIGHT_CONTENT}}</span>
            </div>
            {{/if}}
            <p class="instructions">{{SECONDARY_MESSAGE}}</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} DocuLingua. All rights reserved.</p>
            <p>Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;
// --- End Template ---

// Nodemailer transporter configuration (outside the function for potential reuse)
let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // Your Gmail App Password
    },
  });
} else {
  console.error(
    "Email Service Error: EMAIL_USER or EMAIL_PASS environment variables are not set. Email functionality disabled."
  );
  // Assign a dummy transporter or handle appropriately if email is critical
  transporter = null;
}

/**
 * Generates email content based on type and data.
 * @param {string} type - Type of email (e.g., 'OTP', 'PASSWORD_RESET', 'ACCOUNT_DELETED').
 * @param {object} data - Data needed for the email (e.g., { otp: '123456' }, { name: 'User' }).
 * @returns {object|null} - Object with subject, html, text content or null if type is invalid.
 */
const generateEmailContent = (type, data = {}) => {
  let subject = "";
  let greeting = `Hello${data.name ? " " + data.name : ""},`; // Add name if available
  let mainMessage = "";
  let highlightContent = ""; // For OTP or similar emphasized content
  let secondaryMessage =
    "If you did not initiate this action, please contact our support team immediately.";
  let textContent = "";

  switch (type) {
    case "OTP":
      subject = "Your DocuLingua Verification Code";
      mainMessage =
        "Thank you for using DocuLingua. Please use the following verification code to complete your action:";
      highlightContent = data.otp || "******"; // Use OTP from data
      secondaryMessage = `Enter this code in the app or on the website. This code is valid for 10 minutes. If you did not request this code, you can safely ignore this email.`;
      textContent = `${greeting}\n\n${mainMessage}\n\n${highlightContent}\n\n${secondaryMessage}\n\nThanks,\nThe DocuLingua Team`;
      break;

    case "PASSWORD_RESET_CONFIRMATION":
      subject = "Your DocuLingua Password Has Been Reset";
      mainMessage =
        "Your password for your DocuLingua account has been successfully reset.";
      secondaryMessage =
        "If you did not perform this action, please secure your account immediately and contact support.";
      textContent = `${greeting}\n\n${mainMessage}\n\n${secondaryMessage}\n\nThanks,\nThe DocuLingua Team`;
      break;

    case "PASSWORD_CHANGE_CONFIRMATION":
      subject = "Your DocuLingua Password Has Been Changed";
      mainMessage =
        "Your password for your DocuLingua account has been successfully changed.";
      secondaryMessage =
        "If you did not perform this action, please secure your account immediately and contact support.";
      textContent = `${greeting}\n\n${mainMessage}\n\n${secondaryMessage}\n\nThanks,\nThe DocuLingua Team`;
      break;

    case "ACCOUNT_DELETION_CONFIRMATION":
      subject = "Your DocuLingua Account Has Been Deleted";
      greeting = `Goodbye${data?.name ? " " + data.name : ""},`;
      mainMessage =
        "We confirm that your DocuLingua account and associated data have been permanently deleted as requested.";
      secondaryMessage =
        "We're sorry to see you go. If this was a mistake, please contact support, although account recovery may not be possible. Thank you for using DocuLingua.";
      textContent = `${greeting}\n\n${mainMessage}\n\n${secondaryMessage}\n\nThanks,\nThe DocuLingua Team`;
      break;

    default:
      console.error(`Invalid email type requested: ${type}`);
      return null; // Indicate invalid type
  }

  // Basic template rendering (replace placeholders)
  // For more complex templating, consider libraries like Handlebars or EJS
  let html = emailTemplate
    .replace("{{SUBJECT}}", subject)
    .replace("{{GREETING}}", greeting)
    .replace("{{MAIN_MESSAGE}}", mainMessage)
    .replace("{{SECONDARY_MESSAGE}}", secondaryMessage);

  // Handle optional highlight block
  if (highlightContent) {
    html = html
      .replace("{{#if HIGHLIGHT_CONTENT}}", "") // Remove conditional markers
      .replace("{{/if}}", "")
      .replace("{{HIGHLIGHT_CONTENT}}", highlightContent);
  } else {
    // Remove the highlight block entirely if no content
    const highlightRegex = /\{\{#if HIGHLIGHT_CONTENT\}\}(.|\n)*?\{\{\/if\}\}/;
    html = html.replace(highlightRegex, "");
  }

  return { subject, html, text: textContent };
};

/**
 * Sends a notification email using the configured transporter.
 * @param {string} recipientEmail - The email address of the recipient.
 * @param {string} emailType - The type of email to send (e.g., 'OTP', 'PASSWORD_RESET').
 * @param {object} data - Data to populate the email template (e.g., { otp: '123' }, { name: 'User' }).
 * @returns {Promise<boolean>} - True if email was sent successfully, false otherwise.
 */
const sendEmailNotification = async (recipientEmail, emailType, data = {}) => {
  console.log(data);
  // Check if transporter is configured
  if (!transporter) {
    console.error(
      "Email Service Error: Transporter not available. Cannot send email."
    );
    return false;
  }

  // Validate input
  if (!recipientEmail || !emailType) {
    console.error("Error: Recipient email or email type missing.");
    return false;
  }

  // Generate email content based on type
  const content = generateEmailContent(emailType, data);
  if (!content) {
    return false; // Invalid email type
  }

  try {
    // Define mail options
    const mailOptions = {
      from: `"DocuLingua" <${process.env.EMAIL_USER}>`, // Sender name and address
      to: recipientEmail,
      subject: content.subject,
      html: content.html,
      text: content.text,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    console.log(`${emailType} email sent successfully to ${recipientEmail}`);
    return true; // Indicate success
  } catch (error) {
    console.error(
      `Error sending ${emailType} email to ${recipientEmail}:`,
      error
    );
    return false; // Indicate failure
  }
};

// Export the main function
module.exports = { sendEmailNotification };
