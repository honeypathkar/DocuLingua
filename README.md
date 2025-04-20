# 📱 DocuLingua

**DocuLingua** is a full-stack mobile application that simplifies document management and cross-language communication. With built-in authentication, profile handling, and dynamic theming, DocuLingua is your all-in-one document companion—soon to include OCR scanning and translation capabilities.

---

## ✅ Features

### 🔐 Authentication
- Login & Signup
- JWT-based authentication
- Secure account management

### 👤 Profile Management
- Update profile details
- Upload profile picture (via Cloudinary)
- Delete account

### 🎨 UI & Theming
- Light & Dark Mode support (fully implemented)
- Built with React Native Paper components

### 🧠 Upcoming Features
- Document Scanner (OCR)
- Multilingual Document Translation
- Offline document access

---

## 🧰 Tech Stack

### Frontend:
- React Native (CLI)
- JavaScript
- React Native Paper
- React Navigation
- Context API
- Custom theming (light/dark)

### Backend:
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Multer (file upload)
- Cloudinary (image hosting)


---

## 🚀 How to Run

### Prerequisites:
- Node.js
- npm or yarn
- React Native CLI
- Android Studio or Xcode (for emulator)

### 1. Clone the repo
```bash
git clone https://github.com/honeypathkar/DocuLingua.git
```
### 2. Install Dependencies
```bash
cd DocuLingua
npm install
cd backend
npm install
```

### 3. Setup Environment Variables for backend
```bash
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=your_mongodb_connection_string
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
```

### 4. Run Backend Server
```bash
npm start
```

### 4. Start the app
```bash
cd DocuLingua
npx react-native run-android # or run-ios
```

## 📌 Status 
- 🔧 Basic features complete
- 📸 Document Scanner – in progress
- 🌍 Translation – in progress

## Built with ❤️ by Honey

