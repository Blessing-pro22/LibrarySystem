import axios from 'axios';

const instance = axios.create({
  // Force it to use the live Render URL provided by Vercel
  baseURL: import.meta.env.VITE_API_URL
});

export default instance;