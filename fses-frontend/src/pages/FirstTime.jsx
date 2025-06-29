import axios from 'axios';
import React from 'react';  
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useAuth } from '../contexts/AuthContext';

const FirstTime = () => {

    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
    const navigate = useNavigate();
    const CsrfToken = Cookies.get('csrftoken'); 
    const {user} = useAuth();

    const handleChangePassword = () => {
        if (!newPassword || !newPasswordConfirmation) {
            alert('Please enter both new password and confirmation');
            return;
        }
        if (newPassword !== newPasswordConfirmation) {
            alert('Passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }

        // Handle password change logic here
        axios.post('http://localhost:8000/auth/update/', {
            username: username,
            new_password: newPassword,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': CsrfToken, 
            },
            withCredentials: true, // Include cookies in the request
        })
        .then(response => {
            console.log('Password changed successfully:', response.data);
            const isFirstTime = response.data.is_first_time;
            if (isFirstTime) {
                const userRole = response.data.role; // Assuming the role is returned in the response
                const roles = [
                    { id: 'officeAssistant', path: '/officeAssistant' },
                    { id: 'supervisor', path: '/supervisor' },
                    { id: 'programCoordinator', path: '/programCoordinator' },
                    { id: 'pgam', path: '/pgam' }
                ];
                const role = roles.find(r => r.id === userRole);
                if (role) {
                    navigate(role.path);
                } else {
                    alert('Password changed successfully. Please log in again.');
                    navigate('/');
                }
            } else {
                alert('Password changed successfully. Please log in again.');
                navigate('/');
            }
        })
        .catch(error => {
            console.error('Error changing password:', error);
            alert('Failed to change password. Please try again.');
        });
    }

    useEffect(() => {
        if (!user) {
            // If the user is not logged in or not in first-time setup, redirect to login
            navigate('/');
        } else {
            // If the user is logged in, set the username from the user context
            setUsername(user.username);
            const isFirstTime = user.is_first_time; // Assuming this is part of the user object
            if (!isFirstTime) {
                // If the user is not in first-time setup, redirect to the appropriate page based on role
                const roles = [
                    { id: 'OFFICE_ASSISTANT', path: '/officeAssistant' },
                    { id: 'SUPERVISOR', path: '/supervisor' },
                    { id: 'PROGRAM_COORDINATOR', path: '/programCoordinator' },
                    { id: 'PGAM', path: '/pgam' }
                ];
                const role = roles.find(r => r.id === user.role);
                if (role) {
                    navigate(role.path);
                } else {
                    navigate('/');
                }
            }
        }
    }, []);


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
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                New Password 
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                placeholder="Password"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="newPasswordConfirmation"
                value={newPasswordConfirmation}
                onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                placeholder="Password"
                required
                minLength={8}
              />
            </div>

            <button
              onClick={handleChangePassword}
              className="w-full bg-burgundy-700 text-white py-2 px-4 rounded-md hover:bg-burgundy-800 focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Change Password
            </button>

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
};

export default FirstTime;