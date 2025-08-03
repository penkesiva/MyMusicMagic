'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Star } from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  image_url?: string
  project_url?: string
  technologies?: string[]
  year?: string
}

interface PortfolioKeyProjectsDisplayProps {
  portfolioId: string
  title?: string
  description?: string
  projects?: Project[]
  theme?: any
  noContainer?: boolean
}

export default function PortfolioKeyProjectsDisplay({ 
  portfolioId, 
  title = 'Key Projects', 
  description,
  projects = [], 
  theme,
  noContainer = false
}: PortfolioKeyProjectsDisplayProps) {
  const colors = theme?.colors || {
    background: 'bg-gray-900',
    text: 'text-white',
    primary: 'text-blue-400',
    primaryStrong: 'text-blue-300',
    heading: 'text-white',
    accent: 'text-blue-400'
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

  const content = (
    <>
      <div className="mb-8">
        <h2 className={`text-4xl font-bold mb-4 text-center ${colors.heading} ${theme?.fontClasses?.heading || ''}`}>{title}</h2>
        {description && (
          <p className={`text-sm ${colors.text} opacity-80 leading-relaxed text-center ${theme?.fontClasses?.body || ''}`}>{description}</p>
        )}
      </div>

      {projects.length === 0 ? (
        <div className={`text-center py-12 border-2 border-dashed rounded-lg ${colors.text} opacity-60 ${theme?.imageFrames ? 'border-white/20' : 'border-gray-300/20'}`}>
          <p className={`text-lg mb-2 ${theme?.fontClasses?.body || ''}`}>No projects added yet</p>
          <p className={`text-sm ${theme?.fontClasses?.body || ''}`}>Showcase your key projects and achievements</p>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((project, index) => (
            <div key={project.id} className={`p-4 border rounded-lg ${colors.background} ${theme?.imageFrames ? 'border-white/10' : 'border-gray-300/10'}`}>
              <div className="flex items-start gap-4">
                <ProjectImage project={project} />
                <div className="flex-1">
                  <div className="mb-3">
                    <h4 className={`text-lg font-semibold ${colors.heading} mb-2 ${theme?.fontClasses?.heading || ''}`}>{project.title}</h4>
                    {project.description && (
                      <p className={`text-sm ${colors.text} opacity-80 leading-relaxed ${theme?.fontClasses?.body || ''}`}>
                        {project.description}
                      </p>
                    )}
                  </div>
                  
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
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )

  if (noContainer) {
    return content
  }

  return content;
} 