'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase/client'
import Image from 'next/image'

interface Project {
  id: string
  title: string
  description: string
  image_url: string
  project_url: string
  technologies: string[]
  year: string
}

interface PortfolioKeyProjectsInlineEditorProps {
  portfolioId: string
  title?: string
  projects?: Project[]
  theme?: any
  onRefresh?: () => void
}

export default function PortfolioKeyProjectsInlineEditor({ 
  portfolioId, 
  title = 'Key Projects', 
  projects = [], 
  theme,
  onRefresh 
}: PortfolioKeyProjectsInlineEditorProps) {
  const [localProjects, setLocalProjects] = useState<Project[]>(projects)
  const [editingId, setEditingId] = useState<string | null>(null)

  const colors = theme?.colors || {
    background: 'bg-gray-900',
    text: 'text-white',
    primary: 'text-blue-400',
    primaryStrong: 'text-blue-300',
    heading: 'text-white',
    accent: 'text-blue-400'
  }

  useEffect(() => {
    setLocalProjects(projects)
  }, [projects])

  const addProject = () => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      title: '',
      description: '',
      image_url: '',
      project_url: '',
      technologies: [],
      year: new Date().getFullYear().toString()
    }
    setLocalProjects([...localProjects, newProject])
    setEditingId(newProject.id)
  }

  const removeProject = (id: string) => {
    setLocalProjects(localProjects.filter(p => p.id !== id))
    if (editingId === id) {
      setEditingId(null)
    }
  }

  const updateProject = (id: string, field: keyof Project, value: any) => {
    setLocalProjects(localProjects.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ))
  }

  const saveProjects = async () => {
    try {
      const { error } = await supabase
        .from('user_portfolios')
        .update({
          key_projects_json: localProjects
        })
        .eq('id', portfolioId)

      if (error) {
        console.error('Error saving projects:', error)
        alert('Error saving projects')
        return
      }

      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error('Error saving projects:', error)
      alert('Error saving projects')
    }
  }



  const ProjectImage = ({ project }: { project: Project }) => {
    const [imageError, setImageError] = useState(false)
    const [imageLoading, setImageLoading] = useState(true)

    if (!project.image_url || imageError) {
      return (
        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
          <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
        </div>
      )
    }

    return (
      <div className="flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden">
        <Image
          src={project.image_url}
          alt={project.title}
          width={64}
          height={64}
          className="object-cover"
          onLoad={() => setImageLoading(false)}
          onError={() => setImageError(true)}
          unoptimized={project.image_url.startsWith('data:')}
        />
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-700/50 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    )
  }

  const renderProjectCard = (project: Project) => {
    const isEditing = editingId === project.id

    if (isEditing) {
      return (
        <div key={project.id} className={`p-4 border rounded-lg ${colors.background} ${theme?.imageFrames ? 'border-white/10' : 'border-gray-300/10'}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`text-lg font-semibold ${colors.heading}`}>Editing Project</h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setEditingId(null)}
                  variant="outline"
                  className="bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => removeProject(project.id)}
                  variant="outline"
                  className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${colors.text} mb-2`}>Title</label>
              <Input
                value={project.title}
                onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                placeholder="Project title"
                className={`w-full text-sm ${colors.textBox} ${colors.textBoxBorder} ${colors.textBoxText} ${colors.textBoxPlaceholder}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${colors.text} mb-2`}>Description</label>
              <Textarea
                value={project.description}
                onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                placeholder="Project description"
                rows={3}
                className={`w-full text-sm ${colors.textBox} ${colors.textBoxBorder} ${colors.textBoxText} ${colors.textBoxPlaceholder}`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${colors.text} mb-2`}>Image URL</label>
                <Input
                  value={project.image_url}
                  onChange={(e) => updateProject(project.id, 'image_url', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className={`w-full text-sm ${colors.textBox} ${colors.textBoxBorder} ${colors.textBoxText} ${colors.textBoxPlaceholder}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${colors.text} mb-2`}>Project URL</label>
                <Input
                  value={project.project_url}
                  onChange={(e) => updateProject(project.id, 'project_url', e.target.value)}
                  placeholder="https://github.com/..."
                  className={`w-full text-sm ${colors.textBox} ${colors.textBoxBorder} ${colors.textBoxText} ${colors.textBoxPlaceholder}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${colors.text} mb-2`}>Technologies (comma-separated)</label>
              <Input
                value={project.technologies.join(', ')}
                onChange={(e) => updateProject(project.id, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                placeholder="React, Node.js, TypeScript"
                className={`w-full text-sm ${colors.textBox} ${colors.textBoxBorder} ${colors.textBoxText} ${colors.textBoxPlaceholder}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${colors.text} mb-2`}>Year</label>
              <Input
                value={project.year}
                onChange={(e) => updateProject(project.id, 'year', e.target.value)}
                placeholder="2024"
                className={`w-full text-sm ${colors.textBox} ${colors.textBoxBorder} ${colors.textBoxText} ${colors.textBoxPlaceholder}`}
              />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={project.id} className={`p-4 border rounded-lg ${colors.background} ${theme?.imageFrames ? 'border-white/10' : 'border-gray-300/10'}`}>
        <div className="flex items-start gap-4">
          <ProjectImage project={project} />
          <div className="flex-1">
            <h4 className={`text-lg font-semibold ${colors.heading} mb-2`}>{project.title || 'Untitled Project'}</h4>
            {project.description && (
              <p className={`text-sm ${colors.text} opacity-80 leading-relaxed mb-3`}>
                {project.description}
              </p>
            )}
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {project.technologies.map((tech, index) => (
                  <span key={index} className={`px-2 py-1 text-xs rounded-full ${colors.primary} bg-blue-500/10`}>
                    {tech}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-400">
              {project.year && <span>Year: {project.year}</span>}
              {project.project_url && (
                <a 
                  href={project.project_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  View Project →
                </a>
              )}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              onClick={() => setEditingId(project.id)}
              variant="outline"
              className="bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => removeProject(project.id)}
              variant="outline"
              className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Projects List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${colors.heading}`}>Your Projects</h3>
          <div className="flex gap-2">
            <Button
              onClick={addProject}
              variant="outline"
              size="sm"
              className="bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
            <Button
              onClick={saveProjects}
              variant="outline"
              size="sm"
              className="bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
            >
              Save All
            </Button>
          </div>
        </div>

        {localProjects.length === 0 ? (
          <div className={`text-center py-12 border-2 border-dashed rounded-lg ${colors.text} opacity-60 ${theme?.imageFrames ? 'border-white/20' : 'border-gray-300/20'}`}>
            <p className="text-lg mb-2">No projects added yet</p>
            <p className="text-sm mb-4">Add your key projects and achievements</p>
            <Button
              onClick={addProject}
              variant="outline"
              className={`${theme?.imageFrames ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-gray-100/10 border-gray-300/20 text-gray-700 hover:bg-gray-200/20'}`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Project
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {localProjects.map(renderProjectCard)}
          </div>
        )}
      </div>
    </div>
  )
}