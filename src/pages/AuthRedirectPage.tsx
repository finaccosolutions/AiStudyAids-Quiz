// src/pages/AuthRedirectPage.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, ArrowRight, AlertTriangle, Loader } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm'; // Import the new component

const AuthRedirectPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectType, setRedirectType] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      setIsProcessing(true);
      // Get 'type' from query parameters (location.search)
      const queryParams = new URLSearchParams(location.search);
      const type = queryParams.get('type');

      // Get tokens from hash parameters (location.hash)
      const hashParams = new URLSearchParams(location.hash.substring(1)); // Remove the leading '#'
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (type === 'signup') {
        setRedirectType('signup_confirmation');
        setMessage('Your email address has been successfully verified. You can now sign in to your account.');
        setIsProcessing(false);
      } else if (type === 'recovery') {
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });

          if (error) {
            console.error('Error setting session:', error);
            setRedirectType('error');
            setMessage('Failed to set session. The link might be expired or invalid.');
          } else {
            setRedirectType('password_reset');
            setMessage('Please set your new password.');
          }
        } else {
          setRedirectType('error');
          setMessage('Invalid password reset link.');
        }
        setIsProcessing(false);
      } else {
        setRedirectType('unknown');
        setMessage('Unknown redirect type or invalid link.');
        setIsProcessing(false);
      }
    };

    handleRedirect();
  }, [location]);

  const handleGoToSignIn = () => {
    navigate('/auth?mode=signin');
  };

  const handlePasswordResetSuccess = () => {
    setRedirectType('password_reset_success');
    setMessage('Your password has been successfully reset. You can now sign in with your new password.');
    setIsProcessing(false);
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing...</h2>
          <p className="text-gray-600">Please wait while we confirm your request.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-2 border-blue-100 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 pointer-events-none" />
          
          <CardBody className="p-6 sm:p-8 text-center relative z-10">
            {redirectType === 'signup_confirmation' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                >
                  <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                  Email Confirmed!
                </h2>
                <p className="text-gray-600 mb-6 text-base sm:text-lg leading-relaxed">
                  {message}
                </p>
                <motion.button
                  onClick={handleGoToSignIn}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 sm:py-4 px-6 rounded-xl font-bold text-base sm:text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="relative flex items-center justify-center">
                    <span>Go to Sign In</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </motion.button>
              </>
            )}

            {redirectType === 'password_reset' && (
              <ResetPasswordForm onResetSuccess={handlePasswordResetSuccess} />
            )}

            {redirectType === 'password_reset_success' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                >
                  <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                  Password Reset Successful!
                </h2>
                <p className="text-gray-600 mb-6 text-base sm:text-lg leading-relaxed">
                  {message}
                </p>
                <motion.button
                  onClick={handleGoToSignIn}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 sm:py-4 px-6 rounded-xl font-bold text-base sm:text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="relative flex items-center justify-center">
                    <span>Go to Sign In</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </motion.button>
              </>
            )}

            {(redirectType === 'error' || redirectType === 'unknown') && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                >
                  <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                  Error
                </h2>
                <p className="text-gray-600 mb-6 text-base sm:text-lg leading-relaxed">
                  {message}
                </p>
                <motion.button
                  onClick={handleGoToSignIn}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 sm:py-4 px-6 rounded-xl font-bold text-base sm:text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="relative flex items-center justify-center">
                    <span>Go to Sign In</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </motion.button>
              </>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthRedirectPage;