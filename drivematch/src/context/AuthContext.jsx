// src/context/AuthContext.jsx
import { createContext, useEffect, useState, useContext } from "react";
import axios from "axios";

export const AuthContext = createContext();

/**
 * AuthProvider
 *
 * - Supports both token-based (Authorization header) and cookie-based sessions.
 * - Persists token in localStorage when provided by login/signup.
 * - Automatically attempts to fetch current user on mount (so page refresh keeps session).
 * - Sets axios.defaults.withCredentials = true so cookies are sent on cross-origin requests.
 * - Adds a response interceptor that logs out on 401 responses (auto-cleanup).
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]); // store favorites
  const [loadingAuth, setLoadingAuth] = useState(true);

  const AUTH_API = "http://localhost:5000/api/auth";
  const FAV_API = "http://localhost:5000/api/favorites";

  // Always send credentials (cookies) on requests (helps cookie-session setups)
  axios.defaults.withCredentials = true;

  /* ------------------------------------------
     Apply/remove token to axios (Authorization header)
  -------------------------------------------- */
  const setToken = (token) => {
    if (token) {
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  /* ------------------------------------------
     Load favorites (ONLY when user exists)
  -------------------------------------------- */
  const loadFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    try {
      const res = await axios.get(`${FAV_API}/my`);
      setFavorites(res.data || []);
    } catch (err) {
      console.error("Error loading favorites", err);
    }
  };

  /* ------------------------------------------
     Toggle Favorite
  -------------------------------------------- */
  const toggleFavorite = async (vehicleId) => {
    if (!user) return { success: false, loginRequired: true };

    const isFav = favorites.some((v) => v._id === vehicleId);

    try {
      if (isFav) {
        await axios.delete(`${FAV_API}/remove/${vehicleId}`);
      } else {
        await axios.post(`${FAV_API}/add`, { vehicleId });
      }

      await loadFavorites();
      return { success: true };
    } catch (err) {
      console.error("Favorite toggle error", err);
      return { success: false };
    }
  };

  /* ------------------------------------------
     Helper: fetch current user from /me
     Backend should return user info at GET /api/auth/me
  -------------------------------------------- */
  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(`${AUTH_API}/me`);
      // support either res.data.user or res.data
      const userData = res.data?.user ?? res.data ?? null;
      setUser(userData);
      return userData;
    } catch (err) {
      setUser(null);
      return null;
    }
  };

  /* ------------------------------------------
     On mount: try to restore session
     - If token exists in localStorage, set Authorization header
     - Then always call /me to validate session (cookie or token)
  -------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          setToken(token);
        } else {
          // ensure no leftover header
          delete axios.defaults.headers.common["Authorization"];
        }

        // Try to fetch current user (works with token or cookie session)
        const usr = await fetchCurrentUser();
        if (!mounted) return;
        if (!usr) {
          // no user — clear token/header just in case
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        // silent
        setToken(null);
        setUser(null);
      } finally {
        if (mounted) setLoadingAuth(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------
     Whenever user becomes valid → load favorites
  -------------------------------------------- */
  useEffect(() => {
    if (user) loadFavorites();
    else setFavorites([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ------------------------------------------
     Global axios interceptor: auto-logout on 401
     (Ejected on unmount)
  -------------------------------------------- */
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          // Clear auth state on unauthorized
          setToken(null);
          setUser(null);
          setFavorites([]);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------
     LOGIN
     Expects { user, token } in response (if token-based)
     If backend uses cookies only, it should still return user and no token.
  -------------------------------------------- */
  const login = async ({ email, password }) => {
    try {
      const res = await axios.post(`${AUTH_API}/login`, { email, password });

      const token = res.data?.token ?? null;
      const userFromRes = res.data?.user ?? res.data ?? null;

      if (token) setToken(token);
      if (userFromRes) setUser(userFromRes);

      // ensure favorites load after successful login
      setTimeout(() => loadFavorites(), 0);

      return { success: true, user: userFromRes };
    } catch (err) {
      console.error("Login error", err);
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  /* ------------------------------------------
     SIGNUP
  -------------------------------------------- */
  const signup = async ({ username, email, password }) => {
    try {
      const res = await axios.post(`${AUTH_API}/signup`, {
        username,
        email,
        password,
      });

      const token = res.data?.token ?? null;
      const userFromRes = res.data?.user ?? res.data ?? null;

      if (token) setToken(token);
      if (userFromRes) setUser(userFromRes);

      setTimeout(() => loadFavorites(), 0);

      return { success: true, user: userFromRes };
    } catch (err) {
      console.error("Signup error", err);
      return {
        success: false,
        message: err.response?.data?.message || "Signup failed",
      };
    }
  };

  /* ------------------------------------------
     LOGOUT
     If backend requires server-side logout (cookie destroy), call it
  -------------------------------------------- */
  const logout = async () => {
    try {
      // attempt server logout endpoint if available
      try {
        await axios.post(`${AUTH_API}/logout`);
      } catch {
        // ignore server logout errors
      }
    } finally {
      setToken(null);
      setUser(null);
      setFavorites([]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        favorites,
        toggleFavorite,
        loadFavorites,
        loadingAuth,
        login,
        signup,
        logout,
        fetchCurrentUser,
        setToken, // exported in case advanced callers need to set token manually
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);