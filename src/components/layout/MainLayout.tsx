import React from 'react';
import Header from './Header';
import { Outlet, useLocation } from 'react-router-dom';

const MainLayout: React.FC = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <div className={`w-full max-w-none sm:max-w-7xl sm:mx-auto py-2 sm:py-4 ${location.pathname === '/quiz' ? 'px-0' : 'px-2 sm:px-4 lg:px-8'}`}>
          <Outlet />
        </div>
      </main>
      <footer className="bg-white py-4 border-t border-gray-200">
        <div className="w-full max-w-none sm:max-w-7xl sm:mx-auto px-2 sm:px-4 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Ai Study Aids
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;