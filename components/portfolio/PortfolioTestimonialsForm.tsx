'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/types/database'
import { supabase } from '@/lib/supabase/client'
import { X, Plus, Upload, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type Portfolio = Database['public']['Tables']['user_portfolios']['Row']

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  content: string
  image_url: string
  rating?: number
}

interface PortfolioTestimonialsFormProps {
  portfolioId: string
  onCancel: () => void
  onSuccess: () => void
  theme?: any
}

export default function PortfolioTestimonialsForm({ portfolioId, onCancel, onSuccess, theme }: PortfolioTestimonialsFormProps) {
  const [title, setTitle] = useState('')
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

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
          .select('testimonials_title, testimonials_json')
          .eq('id', portfolioId)
          .single()

        if (error) {
          console.error('Error loading testimonials data:', error)
          return
        }

        if (portfolio) {
          setTitle(portfolio.testimonials_title || '')
          setTestimonials(portfolio.testimonials_json || [])
        }
      } catch (error) {
        console.error('Error loading testimonials data:', error)
      }
    }

    loadData()
  }, [portfolioId])

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `testimonials/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('site-bg')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('site-bg')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleImageUpload = async (file: File, testimonialIndex: number) => {
    try {
      setUploadingImage(true)
      const imageUrl = await uploadImage(file)
      
      const updatedTestimonials = [...testimonials]
      updatedTestimonials[testimonialIndex].image_url = imageUrl
      setTestimonials(updatedTestimonials)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image')
    } finally {
      setUploadingImage(false)
    }
  }

  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      name: '',
      role: '',
      company: '',
      content: '',
      image_url: '',
      rating: 5
    }
    setTestimonials([...testimonials, newTestimonial])
  }

  const removeTestimonial = (index: number) => {
    const updatedTestimonials = testimonials.filter((_, i) => i !== index)
    setTestimonials(updatedTestimonials)
    if (currentSlide >= updatedTestimonials.length) {
      setCurrentSlide(Math.max(0, updatedTestimonials.length - 1))
    }
  }

  const updateTestimonial = (index: number, field: keyof Testimonial, value: any) => {
    const updatedTestimonials = [...testimonials]
    updatedTestimonials[index] = { ...updatedTestimonials[index], [field]: value }
    setTestimonials(updatedTestimonials)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      const { error } = await supabase
        .from('user_portfolios')
        .update({
          testimonials_title: title,
          testimonials_json: testimonials
        })
        .eq('id', portfolioId)

      if (error) {
        console.error('Error updating testimonials:', error)
        alert('Error saving testimonials')
        return
      }

      onSuccess()
    } catch (error) {
      console.error('Error:', error)
      alert('Error saving testimonials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${colors.background} p-6 rounded-lg border border-white/10`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-semibold ${colors.heading}`}>Testimonials</h3>
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
          placeholder="Testimonials"
          className={`w-full text-sm ${colors.background} ${colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
        />
      </div>

      {/* Carousel Preview */}
      {testimonials.length > 0 && (
        <div className="mb-6">
          <h4 className={`text-lg font-medium ${colors.heading} mb-4`}>Preview</h4>
          <div className="relative bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevSlide}
                disabled={testimonials.length <= 1}
                className={`p-2 rounded-full ${colors.text} hover:bg-white/10 disabled:opacity-50`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className={`text-sm ${colors.text}`}>
                {currentSlide + 1} of {testimonials.length}
              </span>
              <button
                onClick={nextSlide}
                disabled={testimonials.length <= 1}
                className={`p-2 rounded-full ${colors.text} hover:bg-white/10 disabled:opacity-50`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center">
              {testimonials[currentSlide]?.image_url && (
                <img
                  src={testimonials[currentSlide].image_url}
                  alt={testimonials[currentSlide].name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-white/20"
                />
              )}
              <p className={`text-sm ${colors.text} italic mb-2`}>
                "{testimonials[currentSlide]?.content || 'No content yet'}"
              </p>
              <p className={`text-sm font-medium ${colors.heading}`}>
                {testimonials[currentSlide]?.name || 'Name'}
              </p>
              <p className={`text-xs ${colors.text} opacity-70`}>
                {testimonials[currentSlide]?.role || 'Role'} at {testimonials[currentSlide]?.company || 'Company'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className={`text-lg font-medium ${colors.heading}`}>Testimonials</h4>
          <Button
            onClick={addTestimonial}
            variant="outline"
            size="sm"
            className="bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </Button>
        </div>

        {testimonials.map((testimonial, index) => (
          <div key={testimonial.id} className={`p-4 border border-white/10 rounded-lg ${colors.background}`}>
            <div className="flex items-center justify-between mb-4">
              <h5 className={`font-medium ${colors.heading}`}>Testimonial {index + 1}</h5>
              <button
                onClick={() => removeTestimonial(index)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className={`block text-sm font-medium ${colors.text} mb-2`}>
                  Name
                </label>
                <Input
                  type="text"
                  value={testimonial.name}
                  onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                  placeholder="John Doe"
                  className={`w-full text-sm ${colors.background} ${colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                />
              </div>

              {/* Role */}
              <div>
                <label className={`block text-sm font-medium ${colors.text} mb-2`}>
                  Role
                </label>
                <Input
                  type="text"
                  value={testimonial.role}
                  onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                  placeholder="CEO"
                  className={`w-full text-sm ${colors.background} ${colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                />
              </div>
            </div>

            {/* Company */}
            <div className="mt-4">
              <label className={`block text-sm font-medium ${colors.text} mb-2`}>
                Company
              </label>
              <Input
                type="text"
                value={testimonial.company}
                onChange={(e) => updateTestimonial(index, 'company', e.target.value)}
                placeholder="Tech Corp"
                className={`w-full text-sm ${colors.background} ${colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
              />
            </div>

            {/* Content */}
            <div className="mt-4">
              <label className={`block text-sm font-medium ${colors.text} mb-2`}>
                Testimonial Content
              </label>
              <Textarea
                value={testimonial.content}
                onChange={(e) => updateTestimonial(index, 'content', e.target.value)}
                placeholder="Share your experience working with this person..."
                rows={3}
                className={`w-full text-sm ${colors.background} ${colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
              />
            </div>

            {/* Image Upload */}
            <div className="mt-4">
              <label className={`block text-sm font-medium ${colors.text} mb-2`}>
                Profile Image
              </label>
              <div className="flex items-center gap-4">
                {testimonial.image_url && (
                  <img
                    src={testimonial.image_url}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover border border-white/10"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, index)
                    }}
                    className="hidden"
                    id={`testimonial-image-${index}`}
                  />
                  <label
                    htmlFor={`testimonial-image-${index}`}
                    className={`inline-flex items-center px-4 py-2 border border-white/20 rounded-lg cursor-pointer hover:bg-white/10 transition-colors ${colors.text}`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  </label>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="mt-4">
              <label className={`block text-sm font-medium ${colors.text} mb-2`}>
                Rating (1-5 stars)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => updateTestimonial(index, 'rating', star)}
                    className={`text-2xl ${testimonial.rating && testimonial.rating >= star ? 'text-yellow-400' : 'text-gray-400'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        {testimonials.length === 0 && (
          <div className={`text-center py-8 border-2 border-dashed border-white/20 rounded-lg ${colors.text} opacity-60`}>
            <p>No testimonials added yet.</p>
            <p className="text-sm mt-2">Click "Add Testimonial" to get started.</p>
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
          {loading ? 'Saving...' : 'Save Testimonials'}
        </Button>
      </div>
    </div>
  )
} 