import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layouts & Guards
import { Navbar } from './components/layout/Navbar';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { RoleRoute } from './components/layout/RoleRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DonorDashboard from './pages/donor/Dashboard';
import PostRelay from './pages/donor/PostRelay';
import RecipientDashboard from './pages/recipient/Dashboard';
import BrowseListings from './pages/recipient/BrowseListings';

// Placeholder Pages
const MyRelays = () => <div className="p-20 text-center text-white">My Relays Coming Soon</div>;
const Impact = () => <div className="p-20 text-center text-white">Impact Report Coming Soon</div>;
const Profile = () => <div className="p-20 text-center text-white">Public Profile Coming Soon</div>;
import Leaderboard from './pages/shared/Leaderboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-midnight font-body flex flex-col">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              
              {/* Protected Donor Routes */}
              <Route path="/donor/*" element={
                <ProtectedRoute>
                  <RoleRoute allowedRole="donor">
                    <Routes>
                      <Route path="dashboard" element={<DonorDashboard />} />
                      <Route path="post" element={<PostRelay />} />
                      <Route path="relays" element={<MyRelays />} />
                      <Route path="impact" element={<Impact />} />
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
                    </Routes>
                  </RoleRoute>
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#03191E',
                color: '#fff',
                border: '1px solid #C1CFDA',
              },
              success: {
                iconTheme: { primary: '#59F8E8', secondary: '#03191E' }
              },
              error: {
                iconTheme: { primary: '#941C2F', secondary: '#fff' }
              }
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
