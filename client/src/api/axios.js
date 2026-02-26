import axios from "axios";

const instance = axios.create({
  baseURL: "https://mechanical-gpt-backend.onrender.com/api"  ||   import.meta.env.VITE_API_URL
});

export default instance;
