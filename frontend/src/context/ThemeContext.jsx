/**
 * ThemeContext — Phase 2 Enhanced
 * Manages dark/light + simple/pro theme preferences.
 *
 * On login:  reads saved preferences FROM the database (via login response user object)
 * On change: saves to the database (PUT /auth/theme) AND localStorage (for quick load)
 * On logout: clears in-memory state; next login restores from DB
 *
 * Isolation: each user's preference is completely separate.
 */

import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import api from "../services/api";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const { user } = useContext(AuthContext);

    /* ── localStorage keys (cache only, DB is source of truth) ── */
    const lsDarkKey = useCallback((u) => u ? `tc_dark_${u.role}_${u.id}` : null, []);
    const lsStyleKey = useCallback((u) => u ? `tc_style_${u.role}_${u.id}` : null, []);

    /* ── State ── */
    const [isDark, setIsDark] = useState(false);
    const [themeStyle, setThemeStyle] = useState("simple");

    /* ── Load preferences when user changes (login/logout) ── */
    useEffect(() => {
        if (!user) {
            // Logged out — reset to defaults
            setIsDark(false);
            setThemeStyle("simple");
            return;
        }

        // 1. Try DB values from the login response (fastest, already in user object)
        const dbDark = user.theme_dark ?? false;
        const dbStyle = user.theme_style ?? "simple";

        // 2. Override with localStorage if DB says false/simple but LS has something more recent
        //    (edge case: user changed theme then connection dropped before DB sync)
        const dk = lsDarkKey(user);
        const sk = lsStyleKey(user);
        try {
            const lsDark = dk ? localStorage.getItem(dk) : null;
            const lsStyle = sk ? localStorage.getItem(sk) : null;
            setIsDark(lsDark !== null ? lsDark === "dark" : dbDark);
            setThemeStyle(lsStyle !== null ? lsStyle : dbStyle);
        } catch {
            setIsDark(dbDark);
            setThemeStyle(dbStyle);
        }
    }, [user, lsDarkKey, lsStyleKey]);

    /* ── Apply classes on <html> ── */
    useEffect(() => {
        const root = document.documentElement;
        isDark ? root.classList.add("dark-mode") : root.classList.remove("dark-mode");
        if (themeStyle === "pro") {
            root.classList.add("theme-pro");
            root.classList.remove("theme-simple");
        } else {
            root.classList.add("theme-simple");
            root.classList.remove("theme-pro");
        }
    }, [isDark, themeStyle]);

    /* ── Persist to localStorage + DB ── */
    const persist = useCallback(async (darkVal, styleVal) => {
        if (!user) return;
        // localStorage (instant)
        const dk = lsDarkKey(user);
        const sk = lsStyleKey(user);
        try {
            if (dk) localStorage.setItem(dk, darkVal ? "dark" : "light");
            if (sk) localStorage.setItem(sk, styleVal);
        } catch { }
        // Database (reliable, survives logout)
        try {
            await api.put("/auth/theme", {
                theme_dark: darkVal,
                theme_style: styleVal,
            });
        } catch (e) {
            // Non-critical: theme still works via localStorage
            console.warn("Theme DB sync failed:", e.message);
        }
    }, [user, lsDarkKey, lsStyleKey]);

    /* ── Toggle dark / light ── */
    const toggleTheme = useCallback(() => {
        setIsDark((prev) => {
            const next = !prev;
            persist(next, themeStyle);
            return next;
        });
    }, [persist, themeStyle]);

    /* ── Toggle simple / pro ── */
    const toggleThemeStyle = useCallback(() => {
        setThemeStyle((prev) => {
            const next = prev === "simple" ? "pro" : "simple";
            persist(isDark, next);
            return next;
        });
    }, [persist, isDark]);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, themeStyle, toggleThemeStyle }}>
            {children}
        </ThemeContext.Provider>
    );
};
