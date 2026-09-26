import axios from 'axios';

// Create a single axios instance with baseURL from environment variable.
// In development: set REACT_APP_API_URL=http://localhost:8081 in frontend/.env
// In production (Vercel): set REACT_APP_API_URL=https://your-backend.onrender.com
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8081',
  withCredentials: true, // Always send cookies (JWT HttpOnly)
});

export default API;
