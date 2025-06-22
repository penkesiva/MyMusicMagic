'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  ArrowRight, 
  Clock, 
  Zap, 
  Star, 
  Users, 
  Palette, 
  Globe, 
  Smartphone,
  CheckCircle,
  Play,
  Music,
  Camera,
  Code,
  TrendingUp
} from 'lucide-react'

export default function WelcomePage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [supabase, router])

  const benefits = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Create in Minutes',
      description: 'From signup to live portfolio in under 5 minutes'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Optimized for speed and performance'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Professional URLs',
      description: 'Get your own custom portfolio URL instantly'
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: 'Mobile Perfect',
      description: 'Looks great on every device automatically'
    }
  ]

  const features = [
    {
      icon: <Music className="w-8 h-8 text-purple-500" />,
      title: 'Audio & Video',
      description: 'Upload tracks, videos, and create playlists with ease.',
    },
    {
      icon: <Camera className="w-8 h-8 text-purple-500" />,
      title: 'Photo Galleries',
      description: 'Showcase your work with beautiful image galleries.',
    },
    {
      icon: <Palette className="w-8 h-8 text-purple-500" />,
      title: 'Custom Themes',
      description: 'Choose from professional themes or create your own.',
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-500" />,
      title: 'Analytics',
      description: 'Track visitors and understand your audience.',
    },
    {
      icon: <Code className="w-8 h-8 text-purple-500" />,
      title: 'SEO Optimized',
      description: 'Built for search engines to help you get discovered.',
    },
    {
      icon: <Users className="w-8 h-8 text-purple-500" />,
      title: 'Social Integration',
      description: 'Connect all your social media profiles seamlessly.',
    }
  ]

  const testimonials = [
    {
      quote: "I created my portfolio in 3 minutes and it looks professional. My clients love it!",
      author: "Sarah Chen",
      role: "Music Producer",
      rating: 5
    },
    {
      quote: "Finally, a portfolio tool that's actually simple to use. No coding required!",
      author: "Marcus Johnson",
      role: "Independent Artist",
      rating: 5
    },
    {
      quote: "The speed and quality blew me away. I've recommended it to all my musician friends.",
      author: "Elena Rodriguez",
      role: "Classical Pianist",
      rating: 5
    }
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white font-sans">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Hero Portfolio</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/signin"
              className="px-6 py-2 text-white hover:text-purple-300 transition-colors text-sm font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-28">
        <div className="relative text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-2 bg-purple-500/20 border border-purple-400/30 rounded-full text-sm font-medium text-purple-300 mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Create Professional Portfolios in Minutes
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Your Portfolio.
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              In Minutes.
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Hero Portfolio is the fastest way to create a stunning, professional portfolio. 
            Perfect for musicians, artists, creators, and anyone who wants to showcase their work beautifully.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
            <Link
              href="/auth/signup"
              className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-10 py-5 rounded-full text-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105"
            >
              <Play className="w-6 h-6 mr-3" />
              Create Your Portfolio
              <ArrowRight className="w-6 h-6 ml-3" />
            </Link>
            
            <div className="flex items-center space-x-2 text-gray-400">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm">No credit card required</span>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="text-purple-400">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{benefit.title}</h3>
                <p className="text-xs text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">
              Everything you need to shine
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Powerful features designed to make your portfolio stand out, without the complexity.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">
              Loved by creators worldwide
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of artists who trust Hero Portfolio to showcase their work.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Ready to create your portfolio?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join the thousands of creators who've already built their professional presence with Hero Portfolio.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              href="/auth/signup"
              className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-6 rounded-full text-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105"
            >
              Start Creating Now
              <ArrowRight className="w-6 h-6 ml-3" />
            </Link>
            
            <p className="text-gray-400 text-sm">
              Free forever • No credit card • Setup in minutes
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Hero Portfolio</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="/auth/signin" className="hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/auth/signup" className="hover:text-white transition-colors">
                Sign Up
              </Link>
              <span>© {new Date().getFullYear()} Hero Portfolio. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 