import axios from "axios";
import Cookies from "cookie-js";

// Set up a base URL and include cookies in requests
const axiosInstance = axios.create({
  baseURL: "http://localhost:8082/api/auth", // Change to your backend API base URL
  withCredentials: true, // Allow cookies to be sent with requests
});

// Intercept requests to add JWT from cookies if needed
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("jwt"); // Get JWT from cookie
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`; // Attach JWT to headers
  }
  return config;
});

export default axiosInstance;
