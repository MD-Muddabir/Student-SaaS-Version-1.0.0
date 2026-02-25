/**
 * Main Application Component
 * Handles routing, authentication, and global state management
 */

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./routes/AppRoutes";
import "./styles/global.css";
import "./themes/pro/pro-theme.css";   // Pro theme — activated by html.theme-pro

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                {/* ThemeProvider must be INSIDE AuthProvider so it can read user */}
                <ThemeProvider>
                    <AppRoutes />
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
