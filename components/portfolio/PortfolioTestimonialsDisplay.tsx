'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  content: string
  image_url: string
  rating?: number
}

interface PortfolioTestimonialsDisplayProps {
  portfolioId: string
  title?: string
  testimonials?: Testimonial[]
  theme?: any
  noContainer?: boolean
}

export default function PortfolioTestimonialsDisplay({ 
  portfolioId, 
  title = 'Testimonials', 
  testimonials = [], 
  theme,
  noContainer = false
}: PortfolioTestimonialsDisplayProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  const colors = theme?.colors || {
    background: 'bg-gray-900',
    text: 'text-white',
    primary: 'text-blue-400',
    primaryStrong: 'text-blue-300'
  }

  // Auto-play carousel
  useEffect(() => {
    if (!autoPlay || testimonials.length <= 3) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [autoPlay, testimonials.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // Show at least 3 testimonials if available
  const getVisibleTestimonials = () => {
    if (testimonials.length <= 3) {
      return testimonials
    }

    const visible = []
    for (let i = 0; i < 3; i++) {
      const index = (currentSlide + i) % testimonials.length
      visible.push(testimonials[index])
    }
    return visible
  }

  const visibleTestimonials = getVisibleTestimonials()

  const content = (
    <>
      {!noContainer && (
        <div className="mb-8 text-center">
          <h3 className={`text-3xl font-bold ${colors.heading} mb-4`}>{title}</h3>
        </div>
      )}

      {testimonials.length === 0 ? (
        <div className={`text-center py-12 border-2 border-dashed border-white/20 rounded-lg ${colors.text} opacity-60`}>
          <p className="text-lg mb-2">No testimonials added yet</p>
          <p className="text-sm">Share what others say about your work</p>
        </div>
      ) : (
        <div className="relative">
          {/* Carousel Container */}
          <div className="relative overflow-hidden">
            <div className="flex gap-6 transition-transform duration-500 ease-in-out">
              {visibleTestimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id} 
                  className="flex-shrink-0 w-full md:w-1/3"
                >
                  <div className={`p-6 rounded-xl border border-white/10 ${colors.background} h-full`}>
                    {/* Profile Image */}
                    <div className="text-center mb-4">
                      {testimonial.image_url ? (
                        <img
                          src={testimonial.image_url}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-white/20"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-white/10 flex items-center justify-center">
                          <span className="text-2xl text-white/60">👤</span>
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    {testimonial.rating && (
                      <div className="flex justify-center mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              testimonial.rating && testimonial.rating >= star 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Content */}
                    <div className="text-center mb-4">
                      <p className={`text-sm ${colors.text} italic leading-relaxed`}>
                        "{testimonial.content}"
                      </p>
                    </div>

                    {/* Author Info */}
                    <div className="text-center">
                      <p className={`font-semibold ${colors.heading} text-sm`}>
                        {testimonial.name}
                      </p>
                      <p className={`text-xs ${colors.text} opacity-70`}>
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {testimonials.length > 3 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {testimonials.length > 3 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: Math.ceil(testimonials.length / 3) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i * 3)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    Math.floor(currentSlide / 3) === i 
                      ? 'bg-white' 
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Auto-play Toggle */}
          {testimonials.length > 3 && (
            <div className="text-center mt-4">
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className={`text-xs ${colors.text} opacity-70 hover:opacity-100 transition-opacity`}
              >
                {autoPlay ? 'Pause' : 'Play'} Auto-scroll
              </button>
            </div>
          )}
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