'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/avatar'
import { Database } from '@/types/database'
import { Save, User, Mail, Globe, Camera, Lock, Eye, EyeOff, Bell, Shield, Key } from 'lucide-react'
import { formatUrl } from '@/lib/utils'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    website_url: '',
    avatar_url: ''
  })

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Email preferences state
  const [emailPreferences, setEmailPreferences] = useState({
    portfolioUpdates: true,
    marketingEmails: false,
    securityAlerts: true
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/signin');
          return;
        }
        setUser(user);

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setFormData({
            username: profileData.username || '',
            full_name: profileData.full_name || '',
            website_url: profileData.website_url || '',
            avatar_url: profileData.avatar_url || ''
          });
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching user data:', error)
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [supabase, router])

  const handleSaveProfile = async () => {
    if (!profile) return

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          website_url: formatUrl(formData.website_url),
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...profile, ...formData })
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile. Please try again.')
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match.')
      setTimeout(() => setError(null), 3000)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.')
      setTimeout(() => setError(null), 3000)
      return
    }

    setIsChangingPassword(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setSuccess('Password updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error changing password:', err)
      setError('Failed to update password. Please try again.')
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      setTimeout(() => setError(null), 3000)
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.')
      setTimeout(() => setError(null), 3000)
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      // Sanitize filename - remove special characters and spaces
      const fileExtension = file.name.split('.').pop() || 'jpg'
      const sanitizedName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
        .replace(/_{2,}/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, '') // Remove leading/trailing underscores
      
      const fileName = `${user.id}/${Date.now()}-${sanitizedName}`

      console.log('Uploading avatar:', {
        bucket: 'avatars',
        fileName,
        fileSize: file.size,
        fileType: file.type
      })

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error details:', uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      console.log('Upload successful:', data)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      console.log('Public URL generated:', publicUrl)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        throw new Error(`Profile update failed: ${updateError.message}`)
      }

      setFormData({ ...formData, avatar_url: publicUrl })
      setProfile({ ...profile!, avatar_url: publicUrl })
      setSuccess('Profile picture updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error uploading avatar:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload profile picture. Please try again.'
      setError(errorMessage)
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsSaving(false)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3366ff]"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Success/Error Messages */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-3 rounded-lg shadow-lg z-50 backdrop-blur-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500/20 border border-red-500/30 text-red-400 px-6 py-3 rounded-lg shadow-lg z-50 backdrop-blur-sm">
          {error}
        </div>
      )}

      <div className="layout-container flex flex-col max-w-[1400px] mx-auto px-4 py-6 md:px-6 md:py-6">
        {/* Header */}
        <header className="flex flex-col gap-1.5 mb-6">
          <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold leading-tight tracking-[-0.02em]">
            Profile Settings
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-base md:text-lg font-normal">
            Manage your profile information and preferences
          </p>
        </header>

        <div className="max-w-4xl">
        <div id="profile-settings-card" className="space-y-6">
          {/* Profile Information Card */}
          <div className="bg-white dark:bg-[#23233a] rounded-xl p-6 border border-slate-200 dark:border-white/10 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-[#3366ff]/20 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-[#3366ff]" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1a2e]/80 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3366ff]/50 focus:border-[#3366ff] transition-all text-sm"
                  placeholder="Enter your username"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This will be used in your portfolio URLs</p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1a2e]/80 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3366ff]/50 focus:border-[#3366ff] transition-all text-sm"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-[#1a1a2e]/40 border border-slate-200 dark:border-white/10 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed text-sm"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Email cannot be changed</p>
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Website URL</label>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1a2e]/80 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3366ff]/50 focus:border-[#3366ff] transition-all text-sm"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            {/* Profile Picture Upload */}
            <div className="mt-6">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Profile Picture</label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-[#3366ff]/20 flex items-center justify-center border-2 border-[#3366ff]/30">
                  {formData.avatar_url ? (
                    <img 
                      src={formData.avatar_url} 
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={`text-[#3366ff] font-semibold ${formData.avatar_url ? 'hidden' : ''}`}>
                    {formData.full_name ? formData.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#3366ff] hover:bg-[#4a7dfa] text-white rounded-lg transition-all duration-300 text-xs font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                    <Camera className="w-4 h-4" />
                    <span>Upload Photo</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={isSaving}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {isSaving ? 'Uploading profile picture...' : 'Upload a profile picture (max 5MB)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings Card */}
          <div className="bg-white dark:bg-[#23233a] rounded-xl p-6 border border-slate-200 dark:border-white/10 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security Settings</h2>
            </div>
            
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1a2e]/80 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3366ff]/50 focus:border-[#3366ff] transition-all text-sm pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1a2e]/80 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3366ff]/50 focus:border-[#3366ff] transition-all text-sm pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1a2e]/80 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3366ff]/50 focus:border-[#3366ff] transition-all text-sm pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Change Password Button */}
              <div className="flex justify-end">
                <button
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium flex items-center space-x-2"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Changing...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Email Preferences Card */}
          <div className="bg-white dark:bg-[#23233a] rounded-xl p-6 border border-slate-200 dark:border-white/10 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-blue-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Email Preferences</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#1a1a2e]/80 rounded-lg">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Portfolio Updates</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Get notified when your portfolio is published or updated</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailPreferences.portfolioUpdates}
                    onChange={(e) => setEmailPreferences({ ...emailPreferences, portfolioUpdates: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#3366ff]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3366ff]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#1a1a2e]/80 rounded-lg">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Marketing Emails</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Receive updates about new features and promotions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailPreferences.marketingEmails}
                    onChange={(e) => setEmailPreferences({ ...emailPreferences, marketingEmails: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#3366ff]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3366ff]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#1a1a2e]/80 rounded-lg">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Security Alerts</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Get notified about account security events</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailPreferences.securityAlerts}
                    onChange={(e) => setEmailPreferences({ ...emailPreferences, securityAlerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#3366ff]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3366ff]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Account Information Card */}
          <div className="bg-white dark:bg-[#23233a] rounded-xl p-6 border border-slate-200 dark:border-white/10 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Account Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">User ID</h3>
                <p className="text-slate-900 dark:text-white text-xs font-mono bg-slate-50 dark:bg-[#1a1a2e]/80 px-3 py-2 rounded-lg">{user?.id}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Account Created</h3>
                <p className="text-slate-900 dark:text-white text-sm">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Last Updated</h3>
                <p className="text-slate-900 dark:text-white text-sm">{profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-4 py-2 bg-[#3366ff] hover:bg-[#4a7dfa] text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 