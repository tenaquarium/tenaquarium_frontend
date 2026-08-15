import  { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data);
        } catch (error) {
          console.error('Failed to load user profile', error);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.requireOtp) {
        return { requireOtp: true, email: res.data.email };
      }
      const { token: userToken, ...userData } = res.data;
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      localStorage.removeItem('wishlist');
      window.dispatchEvent(new Event('wishlist-updated'));
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  const verifyAdminOtp = async (email, password, otp) => {
    setLoading(true);
    try {
      const deviceInfo = navigator.userAgent;
      const res = await api.post('/auth/verify-admin-otp', { email, password, otp, deviceInfo });
      const { token: userToken, ...userData } = res.data;
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      localStorage.removeItem('wishlist');
      window.dispatchEvent(new Event('wishlist-updated'));
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Verification failed';
    } finally {
      setLoading(false);
    }
  };

  // Register Customer handler
  const register = async (name, email, password, phone) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, phone });
      const { token: userToken, ...userData } = res.data;
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      localStorage.removeItem('wishlist');
      window.dispatchEvent(new Event('wishlist-updated'));
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    } finally {
      setLoading(false);
    }
  };

  // Register Dealer handler
  const registerDealer = async (dealerData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register-dealer', dealerData);
      const { token: userToken, ...userData } = res.data;
      if (userToken) {
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
      }
      localStorage.removeItem('wishlist');
      window.dispatchEvent(new Event('wishlist-updated'));
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Dealer registration failed';
    } finally {
      setLoading(false);
    }
  };

  // Update Profile handler
  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', profileData);
      const { token: userToken, ...userData } = res.data;
      if (userToken) {
        localStorage.setItem('token', userToken);
        setToken(userToken);
      }
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Profile update failed';
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('wishlist');
    setToken(null);
    setUser(null);
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        verifyAdminOtp,
        register,
        registerDealer,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
