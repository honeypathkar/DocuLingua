# 📱 DocuLingua

**DocuLingua** is a full-stack mobile application that simplifies document management and cross-language communication. With integrated authentication (including Google), profile handling, and dynamic theming, DocuLingua is your all-in-one document companion—now featuring OCR scanning and multilingual translation support.

---

## ✅ Features

### 🔐 Authentication
- Login & Signup (Email + Google)
- JWT-based authentication
- Secure account management

### 👤 Profile Management
- Update profile details
- Upload profile picture
- Delete account

### 📄 Document Tools
- OCR-based Document Scanner (English-only detection)
- Translate extracted text to:
  - Hindi 🇮🇳
  - English 🇬🇧
  - French 🇫🇷
  - Spanish 🇪🇸
  - German 🇩🇪

### 🎨 UI & Theming
- Light & Dark Mode support
- Built using React Native Paper components

---

## 🧰 Tech Stack

### Frontend:
- React Native (CLI)
- JavaScript
- React Native Paper
- React Navigation
- Context API
- Custom theming (light/dark)
- ML Kit (for image text extraction)

### Backend:
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Supabase (image hosting)
- Rapid api (for translation)
- pdf-parse (for pdf text extraction)

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
SUPABASE_KEY=your_supabase_api_key
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
GOOGLE_CLIENT_ID=your-google-client-id
RAPID_API=rapid_api_key
RAPID_API_HOST=rapid_host_url
```

### 4. Run Backend Server
```bash
cd backend
npm start
```

### 5. Start the App
```bash
cd DocuLingua
npx react-native run-android # or run-ios
```

## 📌 Status
- ✅ Basic features complete
- ✅ Document Scanner complete (English only)
- ✅ Translation complete (supports 5 target languages)
- 🔄 Project is still under active development


## 👨‍💻 Built with ❤️ by Honey Pathkar
