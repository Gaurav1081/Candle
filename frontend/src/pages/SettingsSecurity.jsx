import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Shield, 
  Lock,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
  Trash2
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const SettingsSecurity = () => {
  const { user, logout, apiCall } = useAuth();
  
  // Change Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete Account State
  const [deleteForm, setDeleteForm] = useState({
    password: ''
  });
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFinalConfirmModal, setShowFinalConfirmModal] = useState(false);

  // Password strength calculator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: 'bg-gray-200' };
    
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[^a-zA-Z0-9]/.test(password)
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    
    const strengthData = {
      0: { text: '', color: 'bg-gray-200' },
      1: { text: 'Very weak', color: 'bg-red-500' },
      2: { text: 'Weak', color: 'bg-red-400' },
      3: { text: 'Fair', color: 'bg-yellow-500' },
      4: { text: 'Good', color: 'bg-green-500' },
      5: { text: 'Strong', color: 'bg-green-600' }
    };
    
    return { strength, ...strengthData[strength], checks };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  // Change Password Handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const validatePasswordForm = () => {
    if (!passwordForm.currentPassword) {
      setPasswordError('Current password is required');
      return false;
    }
    if (!passwordForm.newPassword) {
      setPasswordError('New password is required');
      return false;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return false;
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordError('New password must be different from current password');
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return false;
    }
    return true;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!validatePasswordForm()) {
      return;
    }

    setPasswordLoading(true);

    try {
      // Backend-safe API call - will work when endpoint exists
      await apiCall('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      // Check if it's a "not found" error (endpoint doesn't exist yet)
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        setPasswordError('Password change feature is not yet available on the backend. Please contact support.');
      } else {
        setPasswordError(error.message || 'Failed to change password');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // Delete Account Handlers
  const handleDeleteChange = (e) => {
    setDeleteForm({ password: e.target.value });
    setDeleteError('');
  };

  const handleDeleteInitiate = () => {
    setDeleteError('');
    setDeleteForm({ password: '' });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteForm.password) {
      setDeleteError('Password is required to delete your account');
      return;
    }
    setShowDeleteModal(false);
    setShowFinalConfirmModal(true);
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError('');

    try {
      // Backend-safe API call
      await apiCall('/auth/account', {
        method: 'DELETE',
        body: JSON.stringify({
          password: deleteForm.password
        })
      });

      // Success - log out and redirect
      setShowFinalConfirmModal(false);
      logout();
    } catch (error) {
      setShowFinalConfirmModal(false);
      setShowDeleteModal(false);
      
      // Check if it's a "not found" error (endpoint doesn't exist yet)
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        setDeleteError('Account deletion feature is not yet available on the backend. Please contact support.');
      } else {
        setDeleteError(error.message || 'Failed to delete account');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <Shield className="size-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <p className="text-muted-foreground">Manage your account security and privacy</p>
        </div>
      </div>

      {/* Change Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="size-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordError && (
              <Alert variant="destructive">
                <AlertTriangle className="size-4" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
            
            {passwordSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <Check className="size-4 text-green-600" />
                <AlertDescription className="text-green-800">{passwordSuccess}</AlertDescription>
              </Alert>
            )}

            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                  disabled={passwordLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('current')}
                  disabled={passwordLoading}
                >
                  {showPasswords.current ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your new password"
                  disabled={passwordLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('new')}
                  disabled={passwordLoading}
                >
                  {showPasswords.new ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
              
              {/* Password Strength Indicator */}
              {passwordForm.newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground min-w-[80px]">
                      {passwordStrength.text}
                    </span>
                  </div>
                  
                  {/* Password Requirements */}
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className={`flex items-center gap-1 ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordStrength.checks.length ? <Check className="size-3" /> : <X className="size-3" />}
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordStrength.checks.lowercase ? <Check className="size-3" /> : <X className="size-3" />}
                      <span>Lowercase</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordStrength.checks.uppercase ? <Check className="size-3" /> : <X className="size-3" />}
                      <span>Uppercase</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength.checks.numbers ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordStrength.checks.numbers ? <Check className="size-3" /> : <X className="size-3" />}
                      <span>Numbers</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength.checks.symbols ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordStrength.checks.symbols ? <Check className="size-3" /> : <X className="size-3" />}
                      <span>Symbols</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your new password"
                  disabled={passwordLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('confirm')}
                  disabled={passwordLoading}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <X className="size-3" />
                  Passwords do not match
                </p>
              )}
              {passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="size-3" />
                  Passwords match
                </p>
              )}
            </div>

            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="size-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone - Delete Account */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="size-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will permanently affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {deleteError && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}

          <div className="border border-red-200 rounded-lg p-4 bg-red-50/50">
            <div className="flex items-start justify-between gap-4 ">
              <div className="flex-1 ">
                <h3 className="font-semibold text-red-900">Delete Account</h3>
                <p className="text-sm text-red-700 mt-1">
                  Once you delete your account, there is no going back. All your predictions, 
                  stats, and community posts will be permanently deleted.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteInitiate}
                disabled={deleteLoading}
              >
                <Trash2 className="size-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="size-5" />
              Confirm Account Deletion
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Please enter your password to confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">What will be deleted:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• All your predictions and prediction history</li>
                <li>• Your stats, streak, and leaderboard rankings</li>
                <li>• All community posts and comments</li>
                <li>• Your VS mode matches and records</li>
                <li>• Your profile and account settings</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deletePassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="deletePassword"
                  type={showDeletePassword ? 'text' : 'password'}
                  value={deleteForm.password}
                  onChange={handleDeleteChange}
                  placeholder="Enter your password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                >
                  {showDeletePassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={!deleteForm.password}
            >
              Continue to Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Confirmation Modal */}
      <Dialog open={showFinalConfirmModal} onOpenChange={setShowFinalConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="size-5" />
              Final Confirmation
            </DialogTitle>
            <DialogDescription>
              Are you absolutely sure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 text-center">
              <p className="font-bold text-red-900 text-lg">
                This will permanently delete your account
              </p>
              <p className="text-red-700 text-sm mt-2">
                All data associated with <span className="font-semibold">{user?.email}</span> will be lost forever.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFinalConfirmModal(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Deleting Account...
                </>
              ) : (
                <>
                  <Trash2 className="size-4 mr-2" />
                  Yes, Delete My Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsSecurity;