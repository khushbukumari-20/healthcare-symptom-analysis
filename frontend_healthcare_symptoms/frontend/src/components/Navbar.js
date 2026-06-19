import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, LogOut, User } from 'lucide-react';

const Navbar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl">
            <Heart size={28} />
            <span>HealthAI</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:text-blue-100">Dashboard</Link>
            <Link to="/assessment" className="hover:text-blue-100">New Assessment</Link>
            <Link to="/appointments" className="hover:text-blue-100">Appointments</Link>
            <Link to="/profile" className="flex items-center space-x-1 hover:text-blue-100">
              <User size={20} />
              <span>Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 hover:text-blue-100"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
