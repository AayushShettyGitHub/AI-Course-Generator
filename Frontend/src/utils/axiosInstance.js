import axios from "axios";
import Cookies from "cookie-js";


const axiosInstance = axios.create({
  baseURL: "https://ai-course-generator-ples.onrender.com/api/auth", 
  withCredentials: true, 
});

axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("jwt"); 
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`; 
  }
  return config;
});

export default axiosInstance;
