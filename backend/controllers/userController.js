const UserModel = require("../models/UserModel");
const DocumentModel = require("../models/DocumentModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { sendEmailNotification } = require("../middleware/emailServices"); // Import the new service

// --- Signup ---
const signupUser = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide fullName, email, and password" });
  }

  try {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user (excluding image and documents for signup)
    const newUser = new UserModel({
      fullName,
      email,
      password: hashedPassword,
      // userImage and documents will be handled by update route
    });

    await newUser.save();

    // Generate JWT token (optional: log user in immediately after signup)
    const tokenPayload = { userId: newUser._id };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET); // Token expires in 1 hour

    // Respond with user info (excluding password) and token
    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res
      .status(500)
      .json({ message: "Server error during signup", error: error.message });
  }
};

// --- Login ---
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }

  try {
    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" }); // User not found
    }

    // Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" }); // Incorrect password
    }

    // Generate JWT token
    const tokenPayload = { userId: user._id };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET); // Token expires in 1 hour

    // Respond with token and user info (excluding password)
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        // Include other non-sensitive fields if needed
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res
      .status(500)
      .json({ message: "Server error during login", error: error.message });
  }
};

// --- Get User Details ---
// Requires authentication (verifyToken middleware)
const getUserDetails = async (req, res) => {
  try {
    // User ID is attached to req object by verifyToken middleware
    const userId = req.userId;
    const user = await UserModel.findById(userId).select(
      "-password -userImagePublicId -otp -otpExpiry"
    ); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get User Details Error:", error);
    res.status(500).json({
      message: "Server error fetching user details",
      error: error.message,
    });
  }
};

// --- Update User Account ---
// Requires authentication (verifyToken middleware)
const updateUserAccount = async (req, res) => {
  console.log("req.body:", req.body);
  console.log("req.files:", req.files);
  const userId = req.userId;
  const { fullName, email, language } = req.body;
  const userImage = req.files?.userImage;

  if (!fullName && !email && !userImage && !language) {
    return res.status(400).json({ message: "No update fields provided" });
  }

  try {
    const updateData = {};

    if (fullName) updateData.fullName = fullName;

    if (email) {
      const existingUser = await UserModel.findOne({
        email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res
          .status(409)
          .json({ message: "Email already in use by another account" });
      }
      updateData.email = email;
    }

    if (language) updateData.language = language;

    if (userImage) {
      // Fetch existing user to get old image public_id
      const existingUserData = await UserModel.findById(userId);

      // Delete old image from Cloudinary if it exists
      const oldImagePublicId = existingUserData?.userImagePublicId;
      if (oldImagePublicId) {
        await cloudinary.uploader.destroy(oldImagePublicId);
      }

      // Upload new image
      const uploadResult = await cloudinary.uploader.upload(
        userImage.tempFilePath,
        {
          folder: "user-images",
          quality: "30", // Low quality setting
          fetch_format: "auto", // Convert to modern formats
          width: 400,
          height: 400,
          crop: "limit",
        }
      );

      updateData.userImage = uploadResult.secure_url;
      updateData.userImagePublicId = uploadResult.public_id;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found for update" });
    }

    res.status(200).json({
      message: "Account updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update User Account Error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: "Server error updating account",
      error: error.message,
    });
  }
};

// --- Send OTP (for Forgot Password) ---
const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Please provide email" });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      // Still send a 200 OK to prevent email enumeration attacks
      console.log(`Password reset requested for non-existent email: ${email}`);
      return res.status(200).json({
        message: "If an account with this email exists, an OTP has been sent.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Ensure OTP is string if needed
    const otpExpiry = Date.now() + 600000; // OTP expires in 10 minutes

    user.otp = otp; // Ensure your UserModel has 'otp' and 'otpExpiry' fields
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email using the new service
    const emailSent = await sendEmailNotification(email, "OTP", { otp: otp });

    if (!emailSent) {
      // Log the error but inform the user generically
      console.error(`Failed to send OTP email to ${email}`);
      // Don't reveal the failure explicitly to the user in production
      return res
        .status(500)
        .json({ message: "Error processing request. Please try again later." }); // Or a more generic success message
    }

    res.status(200).json({
      message: "If an account with this email exists, an OTP has been sent.",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({
      message: "Server error during OTP request",
      error: error.message,
    });
  }
};

// --- Verify OTP and Reset Password (Forgot Password Flow) ---
const forgotPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ message: "Please provide email, OTP, and new password" });
  }

  try {
    const user = await UserModel.findOne({
      email,
      otp: otp, // Match the received OTP
      otpExpiry: { $gt: Date.now() }, // Check if OTP is still valid
    });

    if (!user) {
      // Generic message for invalid/expired OTP or non-existent user
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP, or user not found." });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password and clear OTP fields
    user.password = hashedPassword;
    user.otp = undefined; // Or null, depending on your schema preference
    user.otpExpiry = undefined; // Or null
    await user.save();

    // Send password reset confirmation email (fire and forget - don't block response)
    sendEmailNotification(email, "PASSWORD_RESET_CONFIRMATION", {
      name: user.fullName,
    }) // Pass name if available
      .catch((err) =>
        console.error(
          `Failed to send password reset confirmation to ${email}:`,
          err
        )
      );

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Forgot Password Reset Error:", error);
    res.status(500).json({
      message: "Server error during password reset",
      error: error.message,
    });
  }
};

// --- Change Password (Logged-in User) ---
const changePassword = async (req, res) => {
  // Assuming userId is available from auth middleware (req.userId)
  const { oldPassword, newPassword, email } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      message: "Please provide old password and new password",
    });
  }

  if (oldPassword === newPassword) {
    return res.status(400).json({
      message: "New password cannot be the same as the old password.",
    });
  }

  try {
    // Find user by ID
    const user = await UserModel.findOne({ email });
    if (!user) {
      // Should not happen if middleware is correct, but good practice
      return res.status(404).json({ message: "User not found" });
    }

    // Compare provided old password with stored hash
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid old password" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Send password change confirmation email (fire and forget)
    sendEmailNotification(user.email, "PASSWORD_CHANGE_CONFIRMATION", {
      name: user.fullName,
    }).catch((err) =>
      console.error(
        `Failed to send password change confirmation to ${user.email}:`,
        err
      )
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({
      message: "Server error during password change",
      error: error.message,
    });
  }
};

// --- Delete User Account ---
const deleteUserAccount = async (req, res) => {
  const userId = req.userId; // From verifyToken middleware
  let userEmail = null; // Variable to store email before deletion
  let userName = null; // Variable to store name for email personalization

  try {
    // 1. Find the user *before* deleting to get necessary info
    const userToDelete = await UserModel.findById(userId);

    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }
    // Store email and name for notification later
    userEmail = userToDelete.email;
    userName = userToDelete.name; // Assuming you have a 'name' field

    // --- Deletion of Associated Data ---

    // 2. Delete Profile Image from Cloudinary (if it exists)
    const imagePublicId = userToDelete.userImagePublicId;
    if (imagePublicId) {
      try {
        console.log(`Attempting to delete Cloudinary image: ${imagePublicId}`);
        const deletionResult = await cloudinary.uploader.destroy(imagePublicId);
        console.log("Cloudinary deletion result:", deletionResult);
        if (
          deletionResult.result !== "ok" &&
          deletionResult.result !== "not found"
        ) {
          console.warn(
            `Cloudinary image deletion may have failed for public_id: ${imagePublicId}. Result: ${deletionResult.result}`
          );
        }
      } catch (cloudinaryError) {
        console.error(
          `Error deleting image from Cloudinary (public_id: ${imagePublicId}):`,
          cloudinaryError
        );
        // Log but continue
      }
    }

    // 3. Delete Associated Documents
    try {
      const deletionResult = await DocumentModel.deleteMany({ userId: userId });
      console.log(
        `Deleted ${deletionResult.deletedCount} associated documents for user ${userId}`
      );
    } catch (docError) {
      console.error(
        `Error deleting associated documents for user ${userId}:`,
        docError
      );
      // Log but continue (or decide to return 500 if critical)
    }

    // --- Deletion of the User Account ---

    // 4. Delete the user document itself from MongoDB
    await UserModel.findByIdAndDelete(userId);

    // --- Send Confirmation Email (Fire and Forget) ---
    if (userEmail) {
      sendEmailNotification(userEmail, "ACCOUNT_DELETION_CONFIRMATION", {
        name: userToDelete.fullName,
      }).catch((err) =>
        console.error(
          `Failed to send account deletion confirmation to ${userEmail}:`,
          err
        )
      );
    } else {
      console.warn(
        `Could not send deletion confirmation for user ${userId} as email was not retrieved.`
      );
    }

    // --- Success Response ---
    res.status(200).json({
      message: "Account deleted successfully.", // Simplified message
    });
  } catch (error) {
    // --- Central Error Handling ---
    console.error("Delete User Account Error:", error);
    res.status(500).json({
      message: "Server error during account deletion process",
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select(
      "-password -userImagePublicId -otp -otpExpiry"
    );
    res.status(200).json({ users });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({
      message: "Server error fetching all users",
      error: error.message,
    });
  }
};

module.exports = {
  signupUser,
  loginUser,
  getUserDetails,
  updateUserAccount,
  deleteUserAccount,
  changePassword,
  forgotPassword,
  sendOtp,
  changePassword,
  getAllUsers,
};
