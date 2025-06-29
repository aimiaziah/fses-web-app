// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function UTMLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login({ username, password });
    
    if (result.success) {
      // Navigate based on user role from Django backend
      const user = result.user;
      const isFirstTime = user.is_first_time || false;
      console.log(isFirstTime); 
      if (isFirstTime) {
        // Redirect to first time setup page
        navigate('/first-time-setup');
        return;
      } else {
        console.log(user.role); // Debugging line to check user role
        switch (user.role) {
          case 'OFFICE_ASSISTANT':
            navigate('/officeAssistant');
            break;
          case 'SUPERVISOR':
            navigate('/supervisor');
            break;
          case 'PROGRAM_COORDINATOR':
            navigate('/programCoordinator');
            break;
          case 'PGAM':
            navigate('/pgam');
            break;
          default:
            setError('Unknown user role. Please contact administrator.');
        }
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header with Logo */}
        <div className="p-6 flex flex-col items-center">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-burgundy-700 flex items-center justify-center">
              <div className="text-yellow-400 text-2xl font-bold">FSES</div>
            </div>
            <div className="ml-4 text-4xl font-bold text-burgundy-700">
              UTM
            </div>
          </div>
          <div className="text-center mt-2">
            <h2 className="text-burgundy-700 text-lg font-bold">First Stage Evaluation System</h2>
            <p className="text-gray-600 text-sm mt-1">Faculty of Artificial Intelligence</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="px-6 pb-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Staff ID / Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter your staff ID"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter your password"
                required
                minLength={8}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-burgundy-700 text-white py-2 px-4 rounded-md hover:bg-burgundy-800 focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>

            <div className="text-center">
              <a
                href="#"
                className="text-sm text-burgundy-600 hover:text-burgundy-800 underline"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/forgot-password'); 
                }}
              >
                Forgot Password?
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3">
          <p className="text-xs text-gray-500 text-center">
            © 2025 Universiti Teknologi Malaysia. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

// Custom styles for UTM burgundy color
const style = document.createElement('style');
document.head.appendChild(style);
style.sheet.insertRule(`
  .text-burgundy-700 {
    color: #8E2246;
  }
`);
style.sheet.insertRule(`
  .bg-burgundy-700 {
    background-color: #8E2246;
  }
`);
style.sheet.insertRule(`
  .bg-burgundy-800 {
    background-color: #7D1D3F;
  }
`);
style.sheet.insertRule(`
  .hover\\:bg-burgundy-800:hover {
    background-color: #7D1D3F;
  }
`);
style.sheet.insertRule(`
  .text-burgundy-600 {
    color: #A52A5A;
  }
`);
style.sheet.insertRule(`
  .hover\\:text-burgundy-800:hover {
    color: #7D1D3F;
  }
`);
style.sheet.insertRule(`
  .focus\\:ring-burgundy-500:focus {
    --tw-ring-color: rgba(165, 42, 90, 0.5);
  }
`);