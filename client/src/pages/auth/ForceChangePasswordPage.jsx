import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function ForceChangePasswordPage() {
  const navigate = useNavigate();
  const { updateUser, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    
    if (formData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    try {
      setIsLoading(true);
      await authService.changePassword({ 
        currentPassword: formData.currentPassword, 
        newPassword: formData.newPassword 
      });
      
      // Update local user state
      const updatedUser = { ...user, mustChangePassword: false };
      updateUser(updatedUser);
      
      toast.success('Password updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Change Default Password</h1>
        <p className="text-gray-400">
          Welcome {user?.firstName}! For security reasons, you must change your temporary password before accessing the system.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Current Password"
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          required
          placeholder="Enter your temporary password"
          className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-primary-500"
        />

        <Input
          label="New Password"
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          required
          placeholder="At least 6 characters"
          className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-primary-500"
        />

        <Input
          label="Confirm New Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          placeholder="Repeat new password"
          className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-primary-500"
        />

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Update Password & Continue
        </Button>
      </form>
    </div>
  );
}
