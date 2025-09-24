import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Shield, Users } from 'lucide-react';
import logo from "../public/logo.jpg"

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="bg-green-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 hover:text-green-200 transition-colors">
            <img src={logo} className='h-20 w-20' alt="" />
          </Link>

          <div className="flex items-center space-x-6">
            {!user ? (
              <>
                <Link
                  to="/"
                  className={`hover:text-green-200 transition-colors ${location.pathname === '/' ? 'text-green-200' : ''
                    }`}
                >
                  Home
                </Link>
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1 hover:text-green-200 transition-colors ${location.pathname.startsWith('/admin') ? 'text-green-200' : ''
                    }`}
                >
                  <Shield size={16} />
                  <span>Admin</span>
                </Link>
                <Link
                  to="/scout/login"
                  className={`flex items-center space-x-1 hover:text-green-200 transition-colors ${location.pathname.startsWith('/scout') ? 'text-green-200' : ''
                    }`}
                >
                  <Users size={16} />
                  <span>Scouts</span>
                </Link>
              </>
            ) : (
              <>
                <span className="text-green-200">
                  Welcome, {user.name} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 hover:text-green-200 transition-colors bg-green-700 px-3 py-1 rounded"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;