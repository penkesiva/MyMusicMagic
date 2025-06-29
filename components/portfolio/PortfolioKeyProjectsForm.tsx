'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/types/database'
import { supabase } from '@/lib/supabase/client'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type Portfolio = Database['public']['Tables']['user_portfolios']['Row']

interface Project {
  id: string
  title: string
  description: string
}

interface PortfolioKeyProjectsFormProps {
  portfolioId: string
  onCancel: () => void
  onSuccess: () => void
  theme?: any
}

export default function PortfolioKeyProjectsForm({ portfolioId, onCancel, onSuccess, theme }: PortfolioKeyProjectsFormProps) {
  const [title, setTitle] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)

  // Default theme colors if none provided
  const colors = theme?.colors || {
    background: 'bg-gray-900',
    text: 'text-white',
    primary: 'text-blue-400',
    primaryStrong: 'text-blue-300'
  }

  // Load existing data
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: portfolio, error } = await supabase
          .from('user_portfolios')
          .select('key_projects_title, key_projects_json')
          .eq('id', portfolioId)
          .single()

        if (error) {
          console.error('Error loading key projects data:', error)
          return
        }

        if (portfolio) {
          setTitle(portfolio.key_projects_title || '')
          setProjects(portfolio.key_projects_json || [])
        }
      } catch (error) {
        console.error('Error loading key projects data:', error)
      }
    }

    loadData()
  }, [portfolioId])

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: '',
      description: ''
    }
    setProjects([...projects, newProject])
  }

  const removeProject = (index: number) => {
    const updatedProjects = projects.filter((_, i) => i !== index)
    setProjects(updatedProjects)
  }

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const updatedProjects = [...projects]
    updatedProjects[index] = { ...updatedProjects[index], [field]: value }
    setProjects(updatedProjects)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      const { error } = await supabase
        .from('user_portfolios')
        .update({
          key_projects_title: title,
          key_projects_json: projects
        })
        .eq('id', portfolioId)

      if (error) {
        console.error('Error updating key projects:', error)
        alert('Error saving key projects')
        return
      }

      onSuccess()
    } catch (error) {
      console.error('Error:', error)
      alert('Error saving key projects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${colors.background} p-6 rounded-lg border border-white/10`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-semibold ${colors.heading}`}>Key Projects</h3>
        <button
          onClick={onCancel}
          className={`p-2 ${colors.text} opacity-70 hover:opacity-100 transition-opacity`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Section Title */}
      <div className="mb-6">
        <label className={`block text-sm font-medium ${colors.text} mb-2`}>
          Section Title
        </label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Key Projects"
          className={`w-full text-sm ${colors.background} ${colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
        />
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className={`text-lg font-medium ${colors.heading}`}>Projects</h4>
          <Button
            onClick={addProject}
            variant="outline"
            size="sm"
            className="bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>

        {projects.map((project, index) => (
          <div key={project.id} className={`p-4 border border-white/10 rounded-lg ${colors.background}`}>
            <div className="flex items-center justify-between mb-4">
              <h5 className={`font-medium ${colors.heading}`}>Project {index + 1}</h5>
              <button
                onClick={() => removeProject(index)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Project Title */}
            <div className="mb-4">
              <label className={`block text-sm font-medium ${colors.text} mb-2`}>
                Key Project
              </label>
              <Input
                type="text"
                value={project.title}
                onChange={(e) => updateProject(index, 'title', e.target.value)}
                placeholder="Project name"
                className={`w-full text-sm ${colors.background} ${colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
              />
            </div>

            {/* Project Description */}
            <div>
              <label className={`block text-sm font-medium ${colors.text} mb-2`}>
                Description
              </label>
              <Textarea
                value={project.description}
                onChange={(e) => updateProject(index, 'description', e.target.value)}
                placeholder="Describe the project, your role, and key achievements..."
                rows={3}
                className={`w-full text-sm ${colors.background} ${colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
              />
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className={`text-center py-8 border-2 border-dashed border-white/20 rounded-lg ${colors.text} opacity-60`}>
            <p>No projects added yet.</p>
            <p className="text-sm mt-2">Click "Add Project" to get started.</p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">
        <Button
          onClick={onCancel}
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {loading ? 'Saving...' : 'Save Projects'}
        </Button>
      </div>
    </div>
  )
} 