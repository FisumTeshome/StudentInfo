import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Always send cookies with every request
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    axios.get('http://localhost:8081/auth/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('http://localhost:8081/auth/login', { email, password });
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:8081/auth/logout');
    } catch (_) {
      // Silently ignore — always clear local user state
    } finally {
      setUser(null);
    }
  };

  const signup = async (username, email, password) => {
    const res = await axios.post('http://localhost:8081/auth/signup', { username, email, password });
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
