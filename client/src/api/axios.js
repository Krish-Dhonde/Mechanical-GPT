import axios from "axios";

const instance = axios.create({
  baseURL: "https://mechanical-gpt-backend.onrender.com",
});

export default instance;