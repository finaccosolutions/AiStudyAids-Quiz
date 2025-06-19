import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Phone, Lock, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { countries } from '../../data/countries';
import { motion } from 'framer-motion';

interface SignUpProps {
  onToggleMode: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    countryCode: 'IN'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { register, isLoading, error } = useAuthStore();

  const selectedCountry = countries.find(c => c.code === formData.countryCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    try {
      await register(
        formData.email,
        formData.password,
        formData.fullName,
        formData.mobileNumber
      );
      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Registration failed:', error?.message || error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-emerald-50/50 pointer-events-none" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Check Your Email!</h2>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              We've sent a verification link to <strong className="text-green-600">{formData.email}</strong>. 
              Please check your email and click the link to activate your account.
            </p>
            <motion.button
              onClick={onToggleMode}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
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
    <div className="w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden"
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50 pointer-events-none" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl relative"
            >
              <Sparkles className="w-10 h-10 text-white" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-2xl border-2 border-dashed border-indigo-300 opacity-30"
              />
            </motion.div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Create Account
            </h2>
            <p className="text-gray-600 text-lg">Join us and start your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm"
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse" />
                  {error}
                </div>
              </motion.div>
            )}

            <div className="space-y-5">
              {/* Full Name Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative group"
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                    focusedField === 'fullName' ? 'text-indigo-600' : 'text-gray-400'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('fullName')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your full name"
                    required
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md text-lg placeholder-gray-400 text-gray-900"
                  />
                </div>
              </motion.div>

              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative group"
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                    focusedField === 'email' ? 'text-indigo-600' : 'text-gray-400'
                  }`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md text-lg placeholder-gray-400 text-gray-900"
                  />
                </div>
              </motion.div>

              {/* Mobile Number Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="relative group"
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                    focusedField === 'mobileNumber' ? 'text-indigo-600' : 'text-gray-400'
                  }`}>
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="flex">
                    <div className="relative">
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleChange}
                        className="pl-12 pr-3 py-4 border-2 border-gray-200 border-r-0 rounded-l-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white text-lg appearance-none cursor-pointer min-w-[80px] text-gray-900"
                      >
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.code}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('mobileNumber')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Mobile number"
                      required
                      className="flex-1 px-4 py-4 border-2 border-l-0 border-gray-200 rounded-r-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white text-lg placeholder-gray-400 text-gray-900"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="relative group"
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                    focusedField === 'password' ? 'text-indigo-600' : 'text-gray-400'
                  }`}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Create a password"
                    required
                    className="w-full pl-12 pr-14 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md text-lg placeholder-gray-400 text-gray-900"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-indigo-600 transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                </div>
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="relative group"
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                    focusedField === 'confirmPassword' ? 'text-indigo-600' : 'text-gray-400'
                  }`}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Confirm your password"
                    required
                    className="w-full pl-12 pr-14 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md text-lg placeholder-gray-400 text-gray-900"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-indigo-600 transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                </div>
                {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2 flex items-center"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                    Passwords do not match
                  </motion.p>
                )}
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || formData.password !== formData.confirmPassword}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              )}
            </motion.button>
          </form>

          {/* Toggle to Sign In */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-600 text-lg">
              Already have an account?{' '}
              <button
                onClick={onToggleMode}
                className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline transition-all duration-300 relative group"
              >
                Sign In
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300" />
              </button>
            </p>
          </motion.div>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-xl" />
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-xl" />
        </div>
      </motion.div>
    </div>
  );
};