const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // Basic email validation regex
      match: [/\S+@\S+\.\S+/, "is invalid"],
    },
    password: {
      type: String,
      required: true,
      // Consider adding password hashing logic here or in a pre-save hook
    },
    userImage: {
      type: String, // Store image as Base64 string or URL
      required: false, // Or true, depending on your requirement
    },
    documents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Document", // Optional: Reference to a Document model if you have one
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Optional: Add pre-save hook for password hashing here if needed
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
