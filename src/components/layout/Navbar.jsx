import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu, X, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import anime from 'animejs';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { unreadCount, togglePanel } = useNotificationStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (navRef.current) {
      anime({
        targets: navRef.current,
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 600,
        easing: 'easeOutExpo',
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'donor') return '/donor/dashboard';
    return '/recipient/dashboard';
  };

  const getNavLinks = () => {
    if (!user) return [];
    if (user.role === 'donor') {
      return [
        { to: '/donor/dashboard', label: 'Dashboard' },
        { to: '/donor/post', label: 'Post Relay' },
        { to: '/donor/relays', label: 'My Relays' },
        { to: '/donor/impact', label: 'Impact' },
      ];
    }
    if (user.role === 'recipient') {
      return [
        { to: '/recipient/dashboard', label: 'Dashboard' },
        { to: '/recipient/browse', label: 'Browse' },
        { to: '/recipient/claims', label: 'My Claims' },
        { to: '/recipient/impact', label: 'Impact' },
      ];
    }
    if (user.role === 'admin') {
      return [
        { to: '/admin', label: 'Dashboard' },
        { to: '/admin/verify-queue', label: 'Verify Queue' },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/relays', label: 'Relays' },
        { to: '/admin/disputes', label: 'Disputes' },
      ];
    }
    return [];
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl"
      style={{
        opacity: 0,
        background: 'rgba(3, 25, 30, 0.85)',
        borderBottom: '1px solid rgba(193,207,218,0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={getDashboardLink()} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-azure to-cyan flex items-center justify-center text-midnight font-bold text-sm">
              PR
            </div>
            <span className="font-display font-bold text-lg text-white group-hover:text-azure transition-colors">
              PlateRelay
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {getNavLinks().map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-azure/10 text-azure'
                    : 'text-steel hover:text-white hover:bg-steel-10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                {/* Notification Bell */}
                <button
                  onClick={togglePanel}
                  className="relative p-2 rounded-lg hover:bg-steel-10 transition-colors text-steel hover:text-white cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-crimson text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* User Dropdown */}
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-steel-10 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-azure to-cyan flex items-center justify-center text-midnight text-xs font-bold">
                      {user.org_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:inline text-sm text-steel font-medium max-w-[120px] truncate">
                      {user.org_name || user.email}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-steel transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-midnight-light border border-steel-20 rounded-xl shadow-2xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-steel-10">
                        <p className="text-sm font-medium text-white truncate">{user.org_name || 'My Account'}</p>
                        <p className="text-xs text-steel truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to={`/profile/${user._id || 'me'}`}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-steel hover:text-white hover:bg-steel-10 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          Public Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-crimson hover:bg-crimson/10 w-full transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {!user && (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-steel hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-azure text-white text-sm font-medium rounded-xl hover:bg-azure/90 transition-colors btn-azure-glow"
                >
                  Join the Relay
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-steel-10 transition-colors text-steel cursor-pointer"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-steel-10 mt-2 pt-4">
            <div className="flex flex-col gap-1">
              {getNavLinks().map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? 'bg-azure/10 text-azure'
                      : 'text-steel hover:text-white hover:bg-steel-10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-crimson hover:bg-crimson/10 text-left transition-all cursor-pointer"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
export { Navbar };
