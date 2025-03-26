# MU-UniConnect

A comprehensive platform for Mahindra University students, faculty, and club heads.

## Project Structure

This repository contains both frontend and backend code:
- Frontend (React): Located in the root directory
- Backend (Node.js/Express): Located in the `server` directory

## Setup Instructions

### Prerequisites
- Node.js (v14+ recommended)
- MongoDB

### Backend Setup
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

### Frontend Setup
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

## API Documentation

The server runs on port 9000 by default and provides RESTful API endpoints at `/api/`.

## Features

- User authentication (students, faculty, club heads, admins)
- Student registration and verification
- Password reset functionality
- Role-based access control
