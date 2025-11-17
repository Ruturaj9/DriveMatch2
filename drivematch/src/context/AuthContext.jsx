import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]); // ⭐ store favorites
  const [loadingAuth, setLoadingAuth] = useState(true);

  const AUTH_API = "http://localhost:5000/api/auth";
  const FAV_API = "http://localhost:5000/api/favorites";

  /* ------------------------------------------
     Apply/remove token to axios
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
    if (!user)
      return { success: false, loginRequired: true };

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
     Check user session at first load
  -------------------------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoadingAuth(false);
      return;
    }

    setToken(token);

    axios
      .get(`${AUTH_API}/me`)
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoadingAuth(false));
  }, []);

  /* ------------------------------------------
     ⭐ NEW: Whenever user becomes valid → load favorites
  -------------------------------------------- */
  useEffect(() => {
    if (user) loadFavorites();
  }, [user]);

  /* ------------------------------------------
     LOGIN
  -------------------------------------------- */
  const login = async ({ email, password }) => {
    try {
      const res = await axios.post(`${AUTH_API}/login`, { email, password });

      const { user, token } = res.data;

      setToken(token);
      setUser(user);

      // wait for token to register, then load favorites
      setTimeout(() => loadFavorites(), 0);

      return { success: true, user };

    } catch (err) {
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

      const { user, token } = res.data;

      setToken(token);
      setUser(user);

      setTimeout(() => loadFavorites(), 0);

      return { success: true, user };

    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Signup failed",
      };
    }
  };

  /* ------------------------------------------
     LOGOUT
  -------------------------------------------- */
  const logout = () => {
    setToken(null);
    setUser(null);
    setFavorites([]); // clear favorites
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
