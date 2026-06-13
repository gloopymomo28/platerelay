import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Shield, AlertTriangle, Package, BarChart3
} from 'lucide-react';

const sidebarLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/verify-queue', label: 'Verify Queue', icon: Shield },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/relays', label: 'Relays', icon: Package },
  { to: '/admin/disputes', label: 'Disputes', icon: AlertTriangle },
];

const Sidebar = () => {
  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-4rem)] bg-midnight-light border-r border-steel-10 p-4 pt-6">
      <div className="mb-6">
        <p className="text-xs text-steel/60 uppercase tracking-wider font-display font-semibold px-3">
          Admin Panel
        </p>
      </div>
      <nav className="flex flex-col gap-1">
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200
              ${isActive
                ? 'bg-azure/10 text-azure'
                : 'text-steel hover:text-white hover:bg-steel-10'
              }
            `}
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
