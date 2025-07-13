'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }
      setUser(user);
    };
    fetchUser();
  }, [supabase, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-gray-200 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-gray-200">
      <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Profile Settings</h1>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-4">User Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Email</h3>
              <p className="text-white">{user.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">User ID</h3>
              <p className="text-white text-sm">{user.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 