import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ className = '' }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsLoggingOut(true);
    
    try {
      const result = await logout();
      
      if (result.success) {
        // Clear any local storage items if needed
        localStorage.removeItem('authToken'); // Remove if you're using token storage
        
        // Redirect to login page
        navigate('/', { replace: true });
      } else {
        console.error('Logout error:', result.error);
        alert('Failed to logout: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center space-x-2 text-gray-600 hover:text-gray-800 ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      title="Logout"
    >
      <LogOut size={20} />
      <span className="hidden sm:inline">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
    </button>
  );
};

export default LogoutButton;