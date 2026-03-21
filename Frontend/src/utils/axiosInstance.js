import axios from "axios";
import Cookies from "cookie-js";
import config from "../config";

const axiosInstance = axios.create({
  baseURL: `${config.API_BASE_URL}/api/auth`, 
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
