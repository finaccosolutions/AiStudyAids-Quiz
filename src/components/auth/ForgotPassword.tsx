// src/components/auth/ForgotPassword.tsx
import React, { useState, useEffect } from 'react'; // Import useEffect
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { motion } from 'framer-motion';

interface ForgotPasswordProps {
  onToggleMode: (mode: 'signin') => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { resetPassword, error } = useAuthStore();

  // Add useEffect to reset isSubmitting on mount
  useEffect(() => {
    setIsSubmitting(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Password reset request failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-8 text-center relative overflow-hidden w-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 pointer-events-none" />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl"
            >
              <Mail className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Check Your Email!</h2>
            <p className="text-gray-600 mb-6 text-base sm:text-lg leading-relaxed">
              We've sent a password reset link to <strong className="text-blue-600">{email}</strong>.
              Please check your inbox and follow the instructions.
            </p>
            <motion.button
              onClick={() => onToggleMode('signin')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 sm:py-4 px-6 rounded-xl font-bold text-base sm:text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Sign In
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-8 relative overflow-hidden w-full"
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl relative"
            >
              <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-dashed border-blue-300 opacity-30"
              />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Forgot Password?
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">Enter your email to reset your password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm"
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse" />
                  <span className="text-sm sm:text-base">{error}</span>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative group"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none transition-colors duration-300 z-10 ${
                  focusedField === 'email' ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md text-base sm:text-lg placeholder-gray-400 text-gray-900"
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 sm:py-4 px-6 rounded-xl font-bold text-base sm:text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Sending Link...
                </div>
              ) : (
                <div className="relative flex items-center justify-center">
                  <span>Send Reset Link</span>
                  <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              )}
            </motion.button>
          </form>

          {/* Toggle to Sign In */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 sm:mt-8 text-center"
          >
            <p className="text-gray-600 text-base sm:text-lg">
              Remember your password?{' '}
              <button
                onClick={() => onToggleMode('signin')}
                className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all duration-300 relative group"
              >
                Sign In
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
              </button>
            </p>
          </motion.div>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-xl" />
          <div className="absolute bottom-4 left-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-xl" />
        </div>
      </motion.div>
    </div>
  );
};