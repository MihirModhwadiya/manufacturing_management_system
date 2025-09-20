# 🔐 MERN Auth System with Vite

A full-featured authentication system built with the MERN stack (MongoDB, Express.js, React TypeScript + Vite, Node.js) featuring modern UI, email verification, and secure authentication.

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248?style=flat&logo=mongodb)](https://mongodb.com/)

## ✨ Features

- 🔐 **Complete Authentication System**: Signup, Login, Password Reset
- 📧 **Email Verification**: Secure email verification with automatic redirects
- 👁️ **Password Visibility Toggle**: Show/hide password functionality on all forms
- 🚀 **Lightning Fast Development**: Powered by Vite with HMR
- 🔒 **Secure**: JWT tokens, bcrypt hashing, input validation
- 📱 **Responsive Design**: Works on all devices with styled-components
- 🎨 **Modern UI**: Clean, professional interface with TypeScript
- 🛡️ **Form Validation**: Client-side and server-side validation

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ 
- **MongoDB** (local installation or MongoDB Atlas)
- **Gmail account** (for email functionality)

### 📋 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd oodo
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies  
   cd ../client && npm install
   ```

3. **Environment Setup**
   
   **Server (.env)**
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Update `server/.env` with your credentials:
   ```bash
   ```bash
   # Database
   MONGO_URI=mongodb://localhost:27017/mern-auth
   
   # Security
   JWT_SECRET=your-super-secret-jwt-key-make-it-very-long-and-complex
   
   # Server
   PORT=5000
   CLIENT_URL=http://localhost:3000
   
   # Email (Gmail SMTP)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password  # Use Gmail App Password, not regular password
   EMAIL_FROM=your_email@gmail.com
   ```

   **Client (.env)** - Optional
   ```bash
   cd client
   cp .env.example .env
   ```

4. **Start the Development Servers**
   
   **Terminal 1 - Backend**
   ```bash
   cd server
   npm run dev
   ```
   
   **Terminal 2 - Frontend** 
   ```bash
   cd client
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
oodo/
├── client/                 # React TypeScript + Vite frontend
│   ├── src/
│   │   ├── pages/         # Auth pages (Login, Signup, Reset)
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── vite.config.ts     # Vite configuration
│   └── package.json       # Frontend dependencies
│
├── server/                 # Express.js backend
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── index.js           # Server entry point
│   ├── .env.example       # Environment template
│   └── package.json       # Backend dependencies
│
├── .gitignore             # Git ignore rules
└── README.md              # You are here!
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register new user with email verification |
| `GET` | `/api/auth/verify/:token` | Verify email (redirects to login) |
| `POST` | `/api/auth/login` | Authenticate user and return JWT |
| `POST` | `/api/auth/forgot` | Send password reset email |
| `POST` | `/api/auth/reset/:token` | Reset password with token |

## 📧 Gmail Setup Guide

1. **Enable 2-Factor Authentication** in your Google Account
2. **Generate App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/apppasswords)
   - Select "Mail" and your device
   - Copy the generated 16-character password
3. **Use App Password** in your `.env` file (not your regular Gmail password)

## 🛠️ Available Scripts

### Server Commands
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

### Client Commands  
```bash
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🔒 Security Features

- ✅ **Password Hashing**: bcrypt with salt rounds
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Email Verification**: Required before account activation
- ✅ **Input Validation**: Client-side and server-side validation
- ✅ **CORS Protection**: Configured for cross-origin requests
- ✅ **Environment Variables**: Sensitive data secured
- ✅ **Password Reset**: Secure token-based reset flow

## 🎨 UI Features

- 👁️ **Show/Hide Password**: Toggle visibility on all password fields
- 📱 **Responsive Design**: Mobile-first approach
- ⚡ **Fast Loading**: Optimized with Vite
- 🎯 **User Feedback**: Clear success/error messages
- 💫 **Smooth Transitions**: Professional animations

## 🚀 Deployment

### Backend (Node.js)
- **Heroku**, **Railway**, **Render**, or any Node.js hosting
- Set environment variables in hosting platform
- Ensure MongoDB connection string is configured

### Frontend (Vite + React)
- **Vercel**, **Netlify**, **GitHub Pages**
- Run `npm run build` to generate `dist/` folder
- Deploy the `dist/` folder to your hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Email not sending?**
- Ensure Gmail 2FA is enabled
- Use App Password, not regular password
- Check spam folder

**MongoDB connection failed?**
- Verify MongoDB is running locally
- Check connection string format
- Ensure database name exists

**Frontend can't reach backend?**
- Verify both servers are running
- Check proxy configuration in `vite.config.ts`
- Ensure ports 3000 and 5000 are available

---

<div align="center">

**Built with ❤️ using the MERN stack + Vite & TypeScript**

[⭐ Star this repo](../../) • [🐛 Report Bug](../../issues) • [💡 Request Feature](../../issues)

</div>