'use client'

interface Project {
  id: string
  title: string
  description: string
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
    primaryStrong: 'text-blue-300'
  }

  const content = (
    <>
      {!noContainer && (
        <div className="mb-6">
          <h3 className={`text-xl font-semibold ${colors.heading} mb-4`}>{title}</h3>
          {description && (
            <p className={`text-sm ${colors.text} opacity-80 leading-relaxed`}>
              {description}
            </p>
          )}
        </div>
      )}

      {projects.length === 0 ? (
        <div className={`text-center py-12 border-2 border-dashed border-white/20 rounded-lg ${colors.text} opacity-60`}>
          <p className="text-lg mb-2">No projects added yet</p>
          <p className="text-sm">Showcase your key projects and achievements</p>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((project, index) => (
            <div key={project.id} className={`p-4 border border-white/10 rounded-lg ${colors.background}`}>
              <div className="mb-3">
                <h4 className={`text-lg font-semibold ${colors.heading} mb-2`}>{project.title}</h4>
                {project.description && (
                  <p className={`text-sm ${colors.text} opacity-80 leading-relaxed`}>
                    {project.description}
                  </p>
                )}
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

  return (
    <div className={`${colors.background} p-6 rounded-lg border border-white/10`}>
      {content}
    </div>
  )
} 