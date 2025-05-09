# 🎓 MU-UniConnect

A comprehensive platform designed to connect Mahindra University students, faculty, and club heads in one integrated ecosystem.

---

## 🚀 Live Deployment

**Try it now:** [https://www.uni-connect.live/](https://www.uni-connect.live/)

---

## 📝 Overview

MU-UniConnect serves as the central hub for Mahindra University's digital community, streamlining communication, event management, and administrative processes. The platform provides role-specific functionality for students, faculty, club heads, and administrators.

---

## ✨ Features

- 🔐 **User Authentication**: Secure login system with role-based access control
- 🎓 **Student Services**: Course registration, event participation, and club memberships
- 👨‍🏫 **Faculty Portal**: Course management, attendance tracking, and student communication
- 🎉 **Club Management**: Event creation, member management, and activity reporting
- 🛠️ **Administrative Dashboard**: User management, access control, and system configuration
- 📢 **Notification System**: Real-time updates and announcements for all users
- 📚 **Resource Sharing**: Document repository and knowledge sharing platform

---

## 🗂️ Project Structure

This repository contains both frontend and backend code:
- **Frontend (React)**: Located in the root directory
- **Backend (Node.js/Express)**: Located in the `server` directory

---

## 🛠️ Technology Stack

- ⚛️ **Frontend**: React.js, Material-UI, Redux
- 🟩 **Backend**: Node.js, Express.js
- 🍃 **Database**: MongoDB
- 🔑 **Authentication**: JWT (JSON Web Tokens)
- ✉️ **Email Service**: SMTP integration for notifications

---

## ⚙️ Setup Instructions

### 📋 Prerequisites
- Node.js (v14+ recommended)
- MongoDB

### 🖥️ Backend Setup
1. Navigate to the server directory:
   ```
   cd server
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=9000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_LIFETIME=1d
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USERNAME=your-email@example.com
   EMAIL_PASSWORD=your-email-password
   EMAIL_FROM=no-reply@mu-uniconnect.com
   ```
4. Start the server:
   ```
   npm start
   ```
   or for development:
   ```
   npm run dev
   ```

### 💻 Frontend Setup
1. In the root directory, install dependencies:
   ```
   npm install
   ```
2. Create a `.env` file in the root directory:
   ```
   REACT_APP_API_URL=http://localhost:9000/api
   ```
3. Start the frontend application:
   ```
   npm start
   ```
4. The application will be available at `http://localhost:3000`

---

## 📚 API Documentation

The backend API server runs on port 9000 by default and provides RESTful endpoints at `/api/`.

### 🔗 Core API Endpoints

| Endpoint                  | Method   | Description                        |
|---------------------------|----------|------------------------------------|
| `/api/auth/register`      | POST     | Register a new user                |
| `/api/auth/login`         | POST     | Authenticate a user                |
| `/api/auth/reset-password`| POST     | Request password reset             |
| `/api/users/profile`      | GET      | Get user profile information       |
| `/api/events`             | GET/POST | Retrieve and create events         |
| `/api/clubs`              | GET/POST | Retrieve and manage clubs          |

_For detailed API documentation and testing, you can use tools like Postman or Swagger._

---

## 🤝 Contributing

Contributions to MU-UniConnect are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature-name`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary and maintained by Mahindra University.
