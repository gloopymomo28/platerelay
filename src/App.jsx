import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layouts & Guards
import { Navbar } from './components/layout/Navbar';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { RoleRoute } from './components/layout/RoleRoute';
import NotificationPanel from './components/layout/NotificationPanel';

// Auth
import useAuthStore from './store/authStore';

// Pages — Public
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Pages — Donor
import DonorDashboard from './pages/donor/Dashboard';
import PostRelay from './pages/donor/PostRelay';
import MyRelays from './pages/donor/MyRelays';

// Pages — Recipient
import RecipientDashboard from './pages/recipient/Dashboard';
import BrowseListings from './pages/recipient/BrowseListings';
import Upgrade from './pages/recipient/Upgrade';

// Pages — Shared
import Leaderboard from './pages/shared/Leaderboard';
import Impact from './pages/shared/Impact';
import Profile from './pages/shared/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const initialize = useAuthStore(state => state.initialize);

  // Bootstrap auth session on app load — this was the critical missing piece
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="min-h-screen bg-midnight font-body flex flex-col">
      <Navbar />
      <NotificationPanel />

      <main className="flex-1 pt-16">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile/:id" element={<Profile />} />

          {/* Protected Donor Routes */}
          <Route path="/donor/*" element={
            <ProtectedRoute>
              <RoleRoute allowedRole="donor">
                <Routes>
                  <Route path="dashboard" element={<DonorDashboard />} />
                  <Route path="post" element={<PostRelay />} />
                  <Route path="relays" element={<MyRelays />} />
                  <Route path="impact" element={<Impact />} />
                  {/* Catch-all: redirect to dashboard */}
                  <Route path="*" element={<DonorDashboard />} />
                </Routes>
              </RoleRoute>
            </ProtectedRoute>
          } />

          {/* Protected Recipient Routes */}
          <Route path="/recipient/*" element={
            <ProtectedRoute>
              <RoleRoute allowedRole="recipient">
                <Routes>
                  <Route path="dashboard" element={<RecipientDashboard />} />
                  <Route path="browse" element={<BrowseListings />} />
                  <Route path="claims" element={<MyRelays />} />
                  <Route path="impact" element={<Impact />} />
                  <Route path="upgrade" element={<Upgrade />} />
                  {/* Catch-all: redirect to dashboard */}
                  <Route path="*" element={<RecipientDashboard />} />
                </Routes>
              </RoleRoute>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0a2e36',
            color: '#fff',
            border: '1px solid rgba(193, 207, 218, 0.2)',
            borderRadius: '12px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          },
          success: {
            iconTheme: { primary: '#59F8E8', secondary: '#03191E' },
          },
          error: {
            iconTheme: { primary: '#941C2F', secondary: '#fff' },
          },
          duration: 4000,
        }}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
