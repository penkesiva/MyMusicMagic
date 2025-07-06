'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PortfolioKeyProjectsDisplay from './PortfolioKeyProjectsDisplay'
import PortfolioKeyProjectsForm from './PortfolioKeyProjectsForm'

interface Project {
  id: string
  title: string
  description: string
  image_url: string
  project_url: string
  technologies: string[]
  year: string
}

interface PortfolioKeyProjectsEditorProps {
  portfolioId: string
  title?: string
  projects?: Project[]
  theme?: any
  onRefresh?: () => void
}

export default function PortfolioKeyProjectsEditor({ 
  portfolioId, 
  title = 'Key Projects', 
  projects = [], 
  theme,
  onRefresh 
}: PortfolioKeyProjectsEditorProps) {
  const [showForm, setShowForm] = useState(false)

  const colors = theme?.colors || {
    background: 'bg-gray-900',
    text: 'text-white',
    primary: 'text-blue-400',
    primaryStrong: 'text-blue-300',
    heading: 'text-white',
    accent: 'text-blue-400'
  }

  const handleSuccess = () => {
    setShowForm(false)
    if (onRefresh) {
      onRefresh()
    }
  }

  if (showForm) {
    return (
      <PortfolioKeyProjectsForm
        portfolioId={portfolioId}
        onCancel={() => setShowForm(false)}
        onSuccess={handleSuccess}
        theme={theme}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          size="sm"
          className="bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Projects
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className={`text-center py-12 border-2 border-dashed rounded-lg ${colors.text} opacity-60 ${theme?.imageFrames ? 'border-white/20' : 'border-gray-300/20'}`}>
          <p className="text-lg mb-2">No projects added yet</p>
          <p className="text-sm mb-4">Showcase your key projects and achievements</p>
          <Button
            onClick={() => setShowForm(true)}
            variant="outline"
            className={`${theme?.imageFrames ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-gray-100/10 border-gray-300/20 text-gray-700 hover:bg-gray-200/20'}`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Project
          </Button>
        </div>
      ) : (
        <PortfolioKeyProjectsDisplay
          portfolioId={portfolioId}
          title=""
          description=""
          projects={projects}
          theme={theme}
          noContainer={true}
        />
      )}
    </div>
  )
} 