const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables from .env file

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No token provided or invalid format" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      // Handle specific errors like token expiration
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({ message: "Forbidden: Token expired" });
      }
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }

    // Attach user information (e.g., user ID) to the request object
    // Ensure your JWT payload includes the user ID when you create the token
    req.userId = decoded.userId; // Assuming your JWT payload has a userId field
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = verifyToken;
