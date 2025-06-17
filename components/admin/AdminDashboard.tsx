import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ArtistInfoForm } from './ArtistInfoForm'
import GalleryManagement from './GalleryManagement'

export function AdminDashboard() {
  const supabase = createClientComponentClient()

  return (
    <div className="min-h-screen bg-dark-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Artist Information Section */}
        <div className="bg-dark-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Artist Information</h2>
          <ArtistInfoForm onSave={() => {}} />
        </div>

        {/* Gallery Management Section */}
        <div className="bg-dark-200 rounded-lg p-6">
          <GalleryManagement />
        </div>
      </div>
    </div>
  )
} 