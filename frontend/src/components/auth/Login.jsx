// components/auth/Login.jsx  (fixed)
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { BackgroundBeams } from '@/components/ui/BackgroundBeams';
import Logo from "../../assets/Logo.png";

const Login = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // ← use loginLoading (not loading) so the page never unmounts on submit
  const { login, loginLoading } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.emailOrUsername.trim() || !formData.password) {
      setLocalError('Please fill in all fields');
      return;
    }

    const result = await login(formData.emailOrUsername.trim(), formData.password);

    if (!result.success) {
      setLocalError(result.error || 'Incorrect email/username or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      <BackgroundBeams />

      <Card className="w-full max-w-md relative z-10 premium-card border-none shadow-glow">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex items-center justify-center mb-6">
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
          <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
          <CardDescription className="text-candle-muted-blue">
            Enter your credentials to access your account
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
              <Label htmlFor="emailOrUsername" className="text-white">Email or Username</Label>
              <Input
                id="emailOrUsername"
                name="emailOrUsername"
                type="text"
                placeholder="Enter your email or username"
                value={formData.emailOrUsername}
                onChange={handleChange}
                required
                disabled={loginLoading}
                className="bg-candle-deep-dark/50 border-candle-electric-blue/30 text-white placeholder:text-candle-muted-blue focus:border-candle-accent-blue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loginLoading}
                  className="pr-10 bg-candle-deep-dark/50 border-candle-electric-blue/30 text-white placeholder:text-candle-muted-blue focus:border-candle-accent-blue"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-candle-muted-blue hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loginLoading}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-6 candle-gradient hover:shadow-glow"
              disabled={loginLoading}
            >
              {loginLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-candle-muted-blue">Don't have an account? </span>
            <button
              type="button"
              className="font-semibold text-candle-accent-blue hover:text-candle-electric-blue transition-colors hover:underline"
              onClick={onToggleMode}
              disabled={loginLoading}
            >
              Sign up
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;