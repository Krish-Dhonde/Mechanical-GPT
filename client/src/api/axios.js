import axios from "axios";

const instance = axios.create({
  baseURL: "https://mechanical-gpt-backend.onrender.com/api",
});

export default instance;