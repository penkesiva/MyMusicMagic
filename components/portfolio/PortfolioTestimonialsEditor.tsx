'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PortfolioTestimonialsDisplay from './PortfolioTestimonialsDisplay'
import PortfolioTestimonialsForm from './PortfolioTestimonialsForm'

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  content: string
  image_url: string
  rating?: number
}

interface PortfolioTestimonialsEditorProps {
  portfolioId: string
  title?: string
  testimonials?: Testimonial[]
  theme?: any
  onRefresh?: () => void
}

export default function PortfolioTestimonialsEditor({ 
  portfolioId, 
  title = 'Testimonials', 
  testimonials = [], 
  theme,
  onRefresh 
}: PortfolioTestimonialsEditorProps) {
  const [showForm, setShowForm] = useState(false)

  const colors = theme?.colors || {
    background: 'bg-gray-900',
    text: 'text-white',
    primary: 'text-blue-400',
    primaryStrong: 'text-blue-300'
  }

  const handleSuccess = () => {
    setShowForm(false)
    if (onRefresh) {
      onRefresh()
    }
  }

  if (showForm) {
    return (
      <PortfolioTestimonialsForm
        portfolioId={portfolioId}
        onCancel={() => setShowForm(false)}
        onSuccess={handleSuccess}
        theme={theme}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${colors.heading}`}>Testimonials</h3>
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          size="sm"
          className="bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonials
        </Button>
      </div>

      {testimonials.length === 0 ? (
        <div className={`text-center py-12 border-2 border-dashed border-white/20 rounded-lg ${colors.text} opacity-60`}>
          <p className="text-lg mb-2">No testimonials added yet</p>
          <p className="text-sm mb-4">Share what others say about your work</p>
          <Button
            onClick={() => setShowForm(true)}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Testimonial
          </Button>
        </div>
      ) : (
        <PortfolioTestimonialsDisplay
          portfolioId={portfolioId}
          title=""
          testimonials={testimonials}
          theme={theme}
          noContainer={true}
        />
      )}
    </div>
  )
} 