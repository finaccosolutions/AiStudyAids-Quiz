import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Lock, Mail, User, Phone } from 'lucide-react';
import { Country } from '../../types';
import { countries } from '../../data/countries';

interface SignUpProps {
  onToggleForm: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onToggleForm }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === 'IN') || countries[0]
  );
  const [showCountryList, setShowCountryList] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationComplete, setRegistrationComplete] = useState(false);
  
  const { register, isLoading, error } = useAuthStore();
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(mobileNumber.replace(/[-\s]/g, ''))) {
      newErrors.mobileNumber = 'Invalid mobile number format (10 digits required)';
    }
    
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await register(
        email, 
        password, 
        fullName, 
        mobileNumber, 
        selectedCountry.code, 
        selectedCountry.name
      );
      setRegistrationComplete(true);
    } catch (err: any) {
      if (err.message.includes('mobile number')) {
        setErrors({ mobileNumber: 'Mobile number already registered' });
      } else if (err.message.includes('email')) {
        setErrors({ email: 'Email already registered' });
      } else {
        setErrors({ submit: err.message || 'Registration failed. Please try again.' });
      }
    }
  };

  if (registrationComplete) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Check Your Email</h3>
        <p className="text-gray-600">
          We've sent a verification link to <span className="font-medium">{email}</span>.
          Please check your email and click the link to verify your account.
        </p>
        <div className="mt-6">
          <Button
            onClick={onToggleForm}
            className="text-purple-600 hover:text-purple-800 font-medium transition-colors hover:underline"
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`auth-input pl-11 ${errors.fullName ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`auth-input pl-11 ${errors.email ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number
          </label>
          <div className="flex items-start space-x-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCountryList(!showCountryList)}
                className="h-12 px-3 flex items-center space-x-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-colors"
              >
                <span className="text-xl">{selectedCountry.flag}</span>
                <span className="text-gray-600 text-sm">{selectedCountry.dialCode}</span>
              </button>
              
              {showCountryList && (
                <div className="absolute z-50 top-full left-0 mt-1 w-72 max-h-60 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="sticky top-0 bg-white border-b border-gray-100 p-2">
                    <input
                      type="text"
                      placeholder="Search countries..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-200"
                      onChange={(e) => {
                        const searchTerm = e.target.value.toLowerCase();
                        const filteredCountries = countries.filter(country =>
                          country.name.toLowerCase().includes(searchTerm) ||
                          country.code.toLowerCase().includes(searchTerm)
                        );
                        // You can add state for filtered countries if needed
                      }}
                    />
                  </div>
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(country);
                        setShowCountryList(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <span className="text-xl">{country.flag}</span>
                      <span className="text-gray-600">{country.name}</span>
                      <span className="text-gray-400 text-sm ml-auto">{country.dialCode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="mobileNumber"
                type="tel"
                placeholder="Mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                className={`auth-input pl-11 ${errors.mobileNumber ? 'border-red-500' : ''}`}
              />
            </div>
          </div>
          {errors.mobileNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`auth-input pl-11 ${errors.password ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`auth-input pl-11 ${errors.confirmPassword ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>
        
        {(error || errors.submit) && (
          <div className="text-red-500 text-sm font-medium py-2 px-3 bg-red-50 rounded-md">
            {error || errors.submit}
          </div>
        )}
        
        <Button
          type="submit"
          className="w-full gradient-bg hover:opacity-90 transition-opacity"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onToggleForm}
            className="text-purple-600 hover:text-purple-800 font-medium transition-colors hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;