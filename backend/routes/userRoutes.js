const express = require("express");
const router = express.Router();
const {
  signupUser,
  loginUser,
  getUserDetails,
  updateUserAccount,
  deleteUserAccount,
  changePassword,
  forgotPassword,
  verifyOTPAndResetPassword,
  getAllUsers,
} = require("../controllers/userController");
const verifyToken = require("../middleware/verifyToken");

// --- Public Routes ---
// POST /api/users/signup - Register a new user
router.post("/signup", signupUser);

// POST /api/users/login - Log in a user
router.post("/login", loginUser);

// --- Protected Routes (Require Authentication) ---
// GET /api/users/me - Get current logged-in user's details
router.get("/me", verifyToken, getUserDetails);

// PUT /api/users/me - Update current logged-in user's account
router.put("/me", verifyToken, updateUserAccount);

// DELETE /api/users/me - Delete current logged-in user's account
router.delete("/me", verifyToken, deleteUserAccount);

// GET /api/users/all - Get all users
router.get("/all", verifyToken, getAllUsers);

// PUT /api/users/change-password - Change password
router.put("/change-password", changePassword);

// POST /api/users/forgot-password - Forgot password
router.post("/forgot-password", forgotPassword);

// POST /api/users/verify-otp-and-reset-password - Verify OTP and reset password
router.post("/verify-otp-and-reset-password", verifyOTPAndResetPassword);

module.exports = router;
