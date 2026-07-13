import axios from 'axios';

const instance = axios.create({
  // Hardcoding the Render backend URL directly so Vite cannot ignore it
  baseURL: 'https://librarysystem-aa13.onrender.com'
});

export default instance;