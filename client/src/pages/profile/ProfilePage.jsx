import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  HiUser, HiShieldCheck, HiClock, HiPencilSquare, HiCamera, HiTrash, 
  HiLockClosed, HiEye, HiEyeSlash, HiCheck, HiXMark 
} from 'react-icons/hi2';

import PageHeader from '../../components/ui/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import profileService from '../../services/profileService';
import authService from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { getImageUrl } from '../../utils/image';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName:  z.string().min(1, 'Last name is required'),
  phone:     z.string().optional().or(z.literal('')),
});

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;

const passwordSchema = z.object({
  currentPassword:  z.string().min(1, 'Current password is required'),
  newPassword:      z.string()
    .min(8, 'Password must be 8–12 characters long')
    .max(12, 'Password must be 8–12 characters long')
    .regex(passwordRegex, 'Password must contain uppercase, lowercase, number, and special character (e.g. Manager@2026)'),
  confirmPassword:  z.string().min(1, 'Please confirm your new password'),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPasswordCurrent, setShowPasswordCurrent] = useState(false);
  const [showPasswordNew, setShowPasswordNew] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Fetch full profile from API
  const { data: profileRes, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
    initialData: { data: user },
  });

  const profile = profileRes?.data || profileRes || user;

  const { register: rP, handleSubmit: hsP, reset: resetP, formState: { errors: eP } } = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: profile?.firstName || '',
      lastName:  profile?.lastName  || '',
      phone:     profile?.phone     || '',
    },
  });

  const { register: rPw, handleSubmit: hsPw, reset: resetPw, formState: { errors: ePw } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => profileService.updateProfile(data),
    onSuccess: (res) => {
      const updated = res?.data || res;
      if (updated && updateUser) updateUser(updated);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
      toast.success('Profile information updated successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update profile'),
  });

  // Change Password Mutation
  const updatePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      authService.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success('Password changed successfully! Please sign in again.');
      resetPw();
      setShowChangePassword(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to change password'),
  });

  // Upload Photo Handler
  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error('Only JPG, JPEG, and PNG image files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      setImgError(false);
      const formData = new FormData();
      formData.append('profilePhoto', file);
      const res = await profileService.uploadPhoto(formData);
      const updatedUser = res?.data || res;
      if (updatedUser && updateUser) updateUser(updatedUser);
      refetch();
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Remove Photo Handler
  const handleRemovePhoto = async () => {
    try {
      setIsUploadingPhoto(true);
      setImgError(false);
      const res = await profileService.deletePhoto();
      const updatedUser = res?.data || res;
      if (updatedUser && updateUser) updateUser(updatedUser);
      refetch();
      toast.success('Profile photo removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const [imgError, setImgError] = useState(false);

  const roleVariant = (role) => role === 'ADMIN' ? 'indigo' : role === 'MANAGER' ? 'blue' : 'purple';
  const initials = `${profile?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`.toUpperCase() || 'U';
  const fullName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'User Profile';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <PageHeader 
        title="My Profile" 
        description="View and manage your account details, role permissions, and security settings." 
      />

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="h-28 bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600" />
        <div className="px-6 pb-6 pt-0 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4 -mt-12">
            {/* Avatar container with photo upload overlay */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-primary-600 border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
                {profile?.profilePhoto && !imgError ? (
                  <img 
                    src={getImageUrl(profile.profilePhoto)} 
                    alt="" 
                    onError={() => setImgError(true)} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-white text-3xl font-extrabold">{initials}</span>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              {/* Photo Hover Overlay */}
              <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 border-4 border-transparent">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-colors"
                  title="Upload / Change Photo"
                >
                  <HiCamera className="w-4 h-4" />
                </button>
                {profile?.profilePhoto && (
                  <button
                    onClick={handleRemovePhoto}
                    disabled={isUploadingPhoto}
                    className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                    title="Remove Photo"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="mb-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{fullName}</h2>
                <Badge variant="green" dot>ACTIVE</Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {profile?.email} · <span className="font-semibold text-primary-600 dark:text-primary-400 uppercase">{profile?.role}</span>
              </p>
            </div>
          </div>

          {/* Edit Profile Action Button */}
          {!isEditing ? (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<HiPencilSquare className="w-4 h-4" />}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<HiXMark className="w-4 h-4" />}
                onClick={() => { resetP(); setIsEditing(false); }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<HiCheck className="w-4 h-4" />}
                isLoading={updateProfileMutation.isPending}
                onClick={hsP((d) => updateProfileMutation.mutate(d))}
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <HiUser className="w-5 h-5 text-primary-600" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Personal Information</h3>
          </div>
          <span className="text-xs text-gray-400">
            {isEditing ? 'Editing Mode' : 'View-Only'}
          </span>
        </div>

        {!isEditing ? (
          /* View-Only Display */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">First Name</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.firstName || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Last Name</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.lastName || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Email Address</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.email || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Phone Number</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.phone || 'Not provided'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Department</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.employee?.department || 'Operations'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Position / Title</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.employee?.position || profile?.role || 'Staff Member'}</p>
            </div>
          </div>
        ) : (
          /* Editable Form */
          <form onSubmit={hsP((d) => updateProfileMutation.mutate(d))} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="First Name" required {...rP('firstName')} error={eP.firstName?.message} />
              <Input label="Last Name"  required {...rP('lastName')}  error={eP.lastName?.message} />
              <Input label="Email Address" value={profile?.email || ''} disabled hint="System login email cannot be changed" />
              <Input label="Phone Number" placeholder="+1 234 567 890" {...rP('phone')} error={eP.phone?.message} />
              <Input label="Department" value={profile?.employee?.department || 'Operations'} disabled hint="Managed by Admin" />
              <Input label="Position" value={profile?.employee?.position || profile?.role || ''} disabled hint="Managed by Admin" />
            </div>
          </form>
        )}
      </div>

      {/* Account Activity Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <HiClock className="w-5 h-5 text-primary-600" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Account Activity & Logs</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-gray-400 dark:text-gray-500 font-semibold uppercase mb-1">Last Login</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : 'Never logged in'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-gray-400 dark:text-gray-500 font-semibold uppercase mb-1">Last Profile Update</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleString() : '—'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-gray-400 dark:text-gray-500 font-semibold uppercase mb-1">Account Created</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-gray-400 dark:text-gray-500 font-semibold uppercase mb-1">Account Status</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
              <span>●</span> Active User
            </p>
          </div>
        </div>
      </div>

      {/* Security Section (Change Password) */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <HiShieldCheck className="w-5 h-5 text-primary-600" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Security & Credentials</h3>
          </div>
          {!showChangePassword && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<HiLockClosed className="w-4 h-4" />}
              onClick={() => setShowChangePassword(true)}
            >
              Change Password
            </Button>
          )}
        </div>

        {showChangePassword ? (
          <form onSubmit={hsPw((d) => updatePasswordMutation.mutate(d))} className="space-y-4 max-w-xl">
            <div className="relative">
              <Input 
                label="Current Password" 
                type={showPasswordCurrent ? 'text' : 'password'} 
                {...rPw('currentPassword')} 
                error={ePw.currentPassword?.message} 
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswordCurrent(!showPasswordCurrent)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPasswordCurrent ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Input 
                  label="New Password" 
                  type={showPasswordNew ? 'text' : 'password'} 
                  {...rPw('newPassword')} 
                  error={ePw.newPassword?.message} 
                  hint="8–12 chars with uppercase, lowercase, number & special char (e.g. Manager@2026)" 
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordNew(!showPasswordNew)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPasswordNew ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                </button>
              </div>
              <Input 
                label="Confirm New Password" 
                type="password" 
                {...rPw('confirmPassword')} 
                error={ePw.confirmPassword?.message} 
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => { resetPw(); setShowChangePassword(false); }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                size="sm"
                isLoading={updatePasswordMutation.isPending}
              >
                Update Password
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Password was last set during account creation or password update. Click "Change Password" above to set a new password.
          </p>
        )}
      </div>
    </div>
  );
}
