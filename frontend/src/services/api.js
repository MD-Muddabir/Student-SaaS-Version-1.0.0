import axios from "axios";

/**
 * Resolve API Base URL (Production-ready)
 */
const getBaseURL = () => {
    let baseURL = import.meta.env.VITE_API_BASE_URL;

    // Remove trailing slash if present
    if (baseURL) {
        baseURL = baseURL.replace(/\/$/, "");
    }

    if (!baseURL || !baseURL.trim()) {
        console.warn("⚠️ VITE_API_BASE_URL is not defined in environment variables");

        if (import.meta.env.DEV) {
            // Development fallback
            return "http://localhost:5000/api";
        } else {
            // Production fallback - Points to the assigned Render backend
            return "https://student-saas-backend.onrender.com/api";
        }
    }

    return baseURL;
};

/**
 * Axios Instance
 */
const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // useful for cookies (optional)
});

/**
 * 🔐 Request Interceptor (Attach Token)
 */
api.interceptors.request.use(
    (config) => {
        try {
            const token = localStorage.getItem("token");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (err) {
            console.warn("⚠️ Token access error:", err.message);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * ⚠️ Response Interceptor (Centralized Error Handling)
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;

        // 🌐 Network error
        if (!response) {
            console.error("🚫 Network error:", error.message);
            alert("Network error. Please check your connection.");
            return Promise.reject(error);
        }

        const status = response.status;
        const data = response.data;

        try {
            // 💳 Payment Required
            if (status === 402 && !window.location.pathname.includes("/checkout")) {
                window.location.href = "/checkout";
            }

            // ⏳ Subscription Expired
            if (status === 403 && data?.code === "SUBSCRIPTION_EXPIRED") {
                window.location.href = "/renew-plan";
            }

            // ⚠️ Suspended Account
            if (status === 403 && data?.message?.includes("suspended")) {
                alert("⚠️ Your account has been suspended. Please contact support.");
            }

            // 🚫 Account Blocked
            if (status === 403 && data?.code === "ACCOUNT_BLOCKED") {
                handleBlockedAccount();
            }

            // 🔑 Unauthorized
            if (status === 401) {
                localStorage.clear();
                window.location.href = "/login";
            }

        } catch (err) {
            console.error("⚠️ Error handling failed:", err.message);
        }

        return Promise.reject(error);
    }
);

/**
 * 🚫 Handle Blocked Account Logic (Clean Separation)
 */
function handleBlockedAccount() {
    try {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            localStorage.clear();
            window.location.href = "/login";
            return;
        }

        const user = JSON.parse(storedUser);

        // Student / Parent
        if (user.role === "student" || user.role === "parent") {
            alert("Your account has been blocked. Contact administrator.");
            localStorage.clear();
            window.location.href = "/login";
            return;
        }

        // Admin / Manager
        if (user.status !== "blocked") {
            user.status = "blocked";
            localStorage.setItem("user", JSON.stringify(user));
        }

        if (!window.location.pathname.includes("/admin/dashboard")) {
            window.location.href = "/admin/dashboard";
        }

    } catch (err) {
        console.error("⚠️ Blocked account handling error:", err.message);
        localStorage.clear();
        window.location.href = "/login";
    }
}

export default api;