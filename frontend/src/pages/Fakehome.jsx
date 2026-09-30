import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Fakehome() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white p-8 shadow-lg text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">Homepage </h1>
        <p className="text-sm text-gray-500">
          This is a temporary home page 
        </p>
        
        <button
          onClick={handleLogout}
          className="w-full rounded-full bg-black py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}