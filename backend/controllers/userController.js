const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

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
    const user = await UserModel.findById(userId).select("-password"); // Exclude password

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

// --- Delete User Account ---
// Requires authentication (verifyToken middleware)
const deleteUserAccount = async (req, res) => {
  const userId = req.userId; // From verifyToken middleware

  try {
    const deletedUser = await UserModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found for deletion" });
    }

    // Optional: Add logic here to delete associated data (e.g., documents)
    // await DocumentModel.deleteMany({ userId: userId });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete User Account Error:", error);
    res
      .status(500)
      .json({ message: "Server error deleting account", error: error.message });
  }
};

module.exports = {
  signupUser,
  loginUser,
  getUserDetails,
  updateUserAccount,
  deleteUserAccount,
};
