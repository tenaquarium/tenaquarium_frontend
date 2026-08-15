import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Capacitor } from '@capacitor/core';
// Global Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import DealerRegister from './pages/DealerRegister';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DealerProfile from './pages/DealerProfile';

// Customer Protected Pages
import CustomerDashboard from './pages/CustomerDashboard';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';

// Dealer Protected Pages
import DealerDashboard from './pages/DealerDashboard';

// Admin Protected Pages
import AdminDashboard from './pages/AdminDashboard';

// Public Tracking Page
import TrackShipment from './pages/TrackShipment';

function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      import('@capacitor/app').then(({ App }) => {
        App.addListener('backButton', ({ canGoBack }) => {
          if (window.location.hash === '#/' || window.location.hash === '' || !canGoBack) {
            App.exitApp();
          } else {
            window.history.back();
          }
        });
      });
    }
  }, []);

  return (
    <AuthProvider>
      <AlertProvider>
        <Router>
        <div className="app-container">
          <Navbar />
          
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dealer/register" element={<DealerRegister />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dealers/:id" element={<DealerProfile />} />
              <Route path="/track" element={<TrackShipment />} />
              <Route path="/track/:trackingNumber" element={<TrackShipment />} />

              {/* Customer Routes */}
              <Route
                path="/customer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'dealer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'dealer']}>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'dealer']}>
                    <Wishlist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'dealer']}>
                    <Checkout />
                  </ProtectedRoute>
                }
              />

              {/* Dealer Routes */}
              <Route
                path="/dealer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['dealer']}>
                    <DealerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Route */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          <Footer />
        </div>
        </Router>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;
