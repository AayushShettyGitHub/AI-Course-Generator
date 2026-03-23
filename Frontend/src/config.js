const config = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8082",
};

if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
    config.API_BASE_URL = "https://ai-course-generator-ples.onrender.com";
}

export default config;
