import { createContext, useEffect, useState, useMemo } from "react";
import axios from "axios";

export const AuthContext = createContext(null);

axios.defaults.baseURL = "/api";

const clean = (t) => (t ? t.replace(/^"|"$/g, "") : t);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => clean(localStorage.getItem("token")));
  const [authReady, setAuthReady] = useState(false);

  const setAuthHeader = (t) => {
    const tt = clean(t);
    if (tt) axios.defaults.headers.common.Authorization = `Bearer ${tt}`;
    else delete axios.defaults.headers.common.Authorization;
  };

  const setAuthToken = (t) => {
    if (t) {
      const tt = clean(t);
      localStorage.setItem("token", tt);
      setToken(tt);
      setAuthHeader(tt);
    } else {
      localStorage.removeItem("token");
      setToken(null);
      setAuthHeader(null);
    }
  };

  const getMe = async () => {
    const { data } = await axios.get("/auth/me");
    setUser(data);
    return data;
  };

  const login = async (email, password) => {
    const { data } = await axios.post("/auth/login", { email, password }); // { token }
    setAuthToken(data.token);
    return await getMe();
  };

  const register = async (username, email, password) => {
    const { data } = await axios.post("/auth/register", { username, email, password }); // { token }
    setAuthToken(data.token);
    return await getMe();
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (token) {
      setAuthHeader(token);
      getMe()
        .catch(() => {
          setAuthToken(null);
          setUser(null);
        })
        .finally(() => setAuthReady(true));
    } else {
      setAuthReady(true);
    }
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "token") setAuthToken(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({ user, token, authReady, login, register, logout }),
    [user, token, authReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
