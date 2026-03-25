import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Target, Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import { BackgroundBeams } from '@/components/ui/BackgroundBeams';
import Logo from "../../assets/Logo.png";

const Signup = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  const { register, loading } = useAuth();

  const validateField = (name, value) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          errors.fullName = 'Full name is required';
        } else if (value.trim().length < 2) {
          errors.fullName = 'Full name must be at least 2 characters';
        } else {
          delete errors.fullName;
        }
        break;
        
      case 'username':
        if (!value.trim()) {
          errors.username = 'Username is required';
        } else if (value.length < 3) {
          errors.username = 'Username must be at least 3 characters';
        } else if (value.length > 20) {
          errors.username = 'Username must be less than 20 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          errors.username = 'Username can only contain letters, numbers, and underscores';
        } else {
          delete errors.username;
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        } else {
          delete errors.password;
        }
        
        // Also validate confirm password if it exists
        if (formData.confirmPassword) {
          if (value !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
          } else {
            delete errors.confirmPassword;
          }
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
        
      default:
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setLocalError('');
    validateField(name, value);
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '' };
    
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[^a-zA-Z0-9]/.test(password)
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    
    const strengthText = {
      0: 'Very weak',
      1: 'Weak',
      2: 'Fair', 
      3: 'Good',
      4: 'Strong',
      5: 'Very strong'
    };
    
    return { strength, text: strengthText[strength], checks };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Validate all fields
    const isValid = Object.keys(formData).every(key => 
      validateField(key, formData[key])
    );

    if (!isValid || Object.keys(validationErrors).length > 0) {
      setLocalError('Please fix the errors above');
      return;
    }

    const result = await register({
      fullName: formData.fullName.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password
    });
    
    if (!result.success) {
      setLocalError(result.error);
    }
  };

  const getFieldIcon = (fieldName) => {
    if (validationErrors[fieldName]) {
      return <X className="size-4 text-red-400" />;
    } else if (formData[fieldName] && !validationErrors[fieldName]) {
      return <Check className="size-4 text-green-400" />;
    }
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      {/* Background Beams Animation */}
      <BackgroundBeams />

      <Card className="w-full max-w-md relative z-10 premium-card border-none shadow-glow max-h-[90vh] overflow-y-auto scrollbar-thin">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex items-center justify-center mb-4">
              <div className="flex items-center">
                            <img 
                              src={Logo} 
                              alt="CANDLE Logo" 
                              className="-ml-10 w-20 h-20 object-contain flex-shrink-0 -mr-4"
                            />
              <div className="text-left">
                <h1 className="text-3xl font-bold candle-text-gradient">CANDLE</h1>
                <p className="text-xs text-candle-muted-blue mt-0.5">Predict. Compete. Learn.</p>
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl text-white">Create your account</CardTitle>
          <CardDescription className="text-candle-muted-blue">
            Start your journey in stock prediction competitions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {localError && (
              <Alert variant="destructive" className="border-red-400/30 bg-red-500/10 backdrop-blur-sm">
                <AlertDescription className="text-red-400">{localError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white">Full Name</Label>
              <div className="relative">
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="pr-10 bg-candle-deep-dark/50 border-candle-electric-blue/30 text-white placeholder:text-candle-muted-blue focus:border-candle-accent-blue"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {getFieldIcon('fullName')}
                </div>
              </div>
              {validationErrors.fullName && (
                <p className="text-sm text-red-400">{validationErrors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="pr-10 bg-candle-deep-dark/50 border-candle-electric-blue/30 text-white placeholder:text-candle-muted-blue focus:border-candle-accent-blue"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {getFieldIcon('username')}
                </div>
              </div>
              {validationErrors.username && (
                <p className="text-sm text-red-400">{validationErrors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="pr-10 bg-candle-deep-dark/50 border-candle-electric-blue/30 text-white placeholder:text-candle-muted-blue focus:border-candle-accent-blue"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {getFieldIcon('email')}
                </div>
              </div>
              {validationErrors.email && (
                <p className="text-sm text-red-400">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="pr-10 bg-candle-deep-dark/50 border-candle-electric-blue/30 text-white placeholder:text-candle-muted-blue focus:border-candle-accent-blue"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-candle-muted-blue hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-candle-electric-blue/20 rounded-full h-2 border border-candle-electric-blue/30">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength.strength <= 2 ? 'bg-red-500' : 
                          passwordStrength.strength <= 3 ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-candle-muted-blue font-medium">
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {Object.entries(passwordStrength.checks).map(([check, passed]) => (
                      <div key={check} className={`flex items-center space-x-1 ${passed ? 'text-green-400' : 'text-candle-muted-blue/50'}`}>
                        {passed ? <Check className="size-3" /> : <X className="size-3" />}
                        <span>
                          {check === 'length' && '8+ characters'}
                          {check === 'lowercase' && 'Lowercase'}
                          {check === 'uppercase' && 'Uppercase'}
                          {check === 'numbers' && 'Numbers'}
                          {check === 'symbols' && 'Symbols'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {validationErrors.password && (
                <p className="text-sm text-red-400">{validationErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="pr-10 bg-candle-deep-dark/50 border-candle-electric-blue/30 text-white placeholder:text-candle-muted-blue focus:border-candle-accent-blue"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-candle-muted-blue hover:text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-sm text-red-400">{validationErrors.confirmPassword}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full mt-6 candle-gradient hover:shadow-glow" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-candle-muted-blue">Already have an account? </span>
            <button
              type="button"
              className="font-semibold text-candle-accent-blue hover:text-candle-electric-blue transition-colors hover:underline"
              onClick={onToggleMode}
              disabled={loading}
            >
              Sign in
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-candle-electric-blue/20 text-center text-xs text-candle-muted-blue">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;