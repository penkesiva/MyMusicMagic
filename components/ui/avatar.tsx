'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User as UserIconSolid, Crown, Shield, HelpCircle, Bell, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  website_url?: string | null;
  created_at: string;
  updated_at: string;
}

interface AvatarProps {
  userProfile: UserProfile | null;
  size?: 'sm' | 'md' | 'lg';
  showMenu?: boolean;
  className?: string;
  onSignOut?: () => void;
  menuPosition?: 'relative' | 'portal';
  menuTargetId?: string; // ID of element to position menu relative to
}

export function Avatar({ 
  userProfile, 
  size = 'md', 
  showMenu = true, 
  className = '',
  onSignOut,
  menuPosition = 'relative',
  menuTargetId
}: AvatarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (userProfile?.username) {
      return userProfile.username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Get user avatar or fallback
  const getUserAvatar = () => {
    if (userProfile?.avatar_url) {
      return userProfile.avatar_url;
    }
    return null;
  };

  // Handle sign out
  const handleSignOut = async () => {
    if (onSignOut) {
      onSignOut();
    } else {
      await supabase.auth.signOut();
      router.push('/');
    }
  };

  // Handle click outside avatar menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (avatarRef.current && !(avatarRef.current as HTMLButtonElement).contains(event.target as Node)) {
        // Check if the click is on a menu item button - if so, don't close the menu
        const target = event.target as Element;
        if (target.closest('[data-menu-item]')) {
          return;
        }
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-lg'
  };

  const statusSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const dropdownSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const menuWidthClasses = {
    sm: 'w-56',
    md: 'w-64',
    lg: 'w-72'
  };

  // Calculate menu position for portal
  const getMenuPosition = () => {
    if (menuPosition === 'portal' && menuTargetId && typeof document !== 'undefined' && typeof window !== 'undefined') {
      const targetElement = document.getElementById(menuTargetId);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const menuWidth = size === 'lg' ? 288 : size === 'md' ? 256 : 224; // w-72, w-64, w-56
        const viewportWidth = window.innerWidth;
        
        // Calculate left position to align with the right edge of the target
        let left = rect.right - menuWidth;
        
        // Ensure menu doesn't go off-screen to the left
        if (left < 16) {
          left = 16;
        }
        
        // Ensure menu doesn't go off-screen to the right
        if (left + menuWidth > viewportWidth - 16) {
          left = viewportWidth - menuWidth - 16;
        }
        
        return {
          top: rect.top - 20, // 20px above the target
          left: left,
          position: 'fixed' as const,
          zIndex: 99999
        };
      }
    }
    return {};
  };

  const [menuStyle, setMenuStyle] = useState({});

  // Recalculate position when menu opens
  useEffect(() => {
    if (menuOpen && menuPosition === 'portal' && typeof window !== 'undefined') {
      setMenuStyle(getMenuPosition());
    }
  }, [menuOpen, menuPosition, menuTargetId, size]);

  return (
    <>
      <div className="relative">
        <button
          ref={avatarRef}
          onClick={() => setMenuOpen((open) => !open)}
          className={`group relative ${sizeClasses[size]} rounded-full bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 transition-all duration-200 border-2 border-purple-400/50 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg hover:shadow-xl z-[99998] ${className}`}
          aria-label="Open profile menu"
        >
          {getUserAvatar() ? (
            <img 
              src={getUserAvatar()!} 
              alt={userProfile?.full_name || userProfile?.username || 'User'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">{getUserInitials()}</span>
            </div>
          )}
          
          {/* Status indicator */}
          <div className={`absolute -bottom-1 -right-1 ${statusSizeClasses[size]} bg-green-500 border-2 border-gray-900 rounded-full flex items-center justify-center`}>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
          
          {/* Hover effect */}
          <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </button>
        
        {/* Dropdown indicator */}
        <ChevronDown className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 ${dropdownSizeClasses[size]} text-purple-300 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
      </div>
      
              {/* Enhanced Dropdown Menu */}
        {showMenu && menuOpen && (
          <div
            className={`${menuPosition === 'portal' ? 'fixed z-[99999]' : 'absolute right-0 mt-3 z-[99999]'} ${menuWidthClasses[size]} bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200`}
            style={menuStyle}
            tabIndex={-1}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
          >
          {/* User Info Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <div className="flex items-center space-x-3">
              <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center border-2 border-purple-400/50`}>
                {getUserAvatar() ? (
                  <img 
                    src={getUserAvatar()!} 
                    alt={userProfile?.full_name || userProfile?.username || 'User'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold">{getUserInitials()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {userProfile?.full_name || userProfile?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {userProfile?.email}
                </p>
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    Free Plan
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              data-menu-item
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Profile Settings clicked!');
                console.log('Current router:', router);
                console.log('Menu open state:', menuOpen);
                setMenuOpen(false);
                console.log('Navigating to /dashboard/profile');
                // Use setTimeout to ensure menu closes before navigation
                setTimeout(() => {
                  console.log('Executing navigation...');
                  router.push('/dashboard/profile');
                }, 100);
              }}
              className="w-full flex items-center px-4 py-3 text-gray-900 dark:text-white hover:bg-purple-100/30 dark:hover:bg-purple-900/30 transition-all duration-200 text-sm font-medium cursor-pointer group"
            >
              <UserIconSolid className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-purple-500 transition-colors" />
              Profile Settings
            </button>
            
            <button
              data-menu-item
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(false);
                // Navigate to billing page
                setTimeout(() => {
                  router.push('/dashboard/billing');
                }, 100);
              }}
              className="w-full flex items-center px-4 py-3 text-gray-900 dark:text-white hover:bg-purple-100/30 dark:hover:bg-purple-900/30 transition-all duration-200 text-sm font-medium cursor-pointer group"
            >
              <Shield className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-purple-500 transition-colors" />
              Billing & Plan
            </button>
            
            <button
              data-menu-item
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(false);
                // TODO: Implement help page
                alert('Help & Support coming soon! This will provide documentation, tutorials, and contact support.');
              }}
              className="w-full flex items-center px-4 py-3 text-gray-900 dark:text-white hover:bg-purple-100/30 dark:hover:bg-purple-900/30 transition-all duration-200 text-sm font-medium cursor-pointer group"
            >
              <HelpCircle className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-purple-500 transition-colors" />
              Help & Support
            </button>
            
            <button
              data-menu-item
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(false);
                // TODO: Implement notifications page
                alert('Notifications coming soon! This will allow you to manage your notification preferences.');
              }}
              className="w-full flex items-center px-4 py-3 text-gray-900 dark:text-white hover:bg-purple-100/30 dark:hover:bg-purple-900/30 transition-all duration-200 text-sm font-medium cursor-pointer group"
            >
              <Bell className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-purple-500 transition-colors" />
              Notifications
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10"></div>

          {/* Sign Out */}
          <div className="py-2">
            <button
              data-menu-item
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Sign Out clicked!');
                console.log('Current router:', router);
                setMenuOpen(false);
                // Use setTimeout to ensure menu closes before signout
                setTimeout(() => {
                  console.log('Executing sign out...');
                  handleSignOut();
                }, 100);
              }}
              className="w-full flex items-center px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-100/20 dark:hover:bg-red-900/20 transition-all duration-200 text-sm font-medium cursor-pointer group"
            >
              <LogOut className="w-4 h-4 mr-3 group-hover:text-red-500 transition-colors" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
} 