'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowRight, Music, Palette, BarChart2, Star, Zap } from 'lucide-react'

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

  const features = [
    {
      icon: <Palette className="w-8 h-8 text-indigo-500" />,
      title: 'Beautiful Themes',
      description: 'Choose from a variety of professionally designed themes to match your style.',
    },
    {
      icon: <Music className="w-8 h-8 text-indigo-500" />,
      title: 'Music & Media',
      description: 'Easily upload and manage your audio tracks, videos, and photo galleries.',
    },
    {
      icon: <BarChart2 className="w-8 h-8 text-indigo-500" />,
      title: 'Simple Analytics',
      description: 'Understand your audience with simple, easy-to-read visitor analytics.',
    },
    {
      icon: <Zap className="w-8 h-8 text-indigo-500" />,
      title: 'Blazing Fast',
      description: 'Your portfolio is optimized for speed, ensuring a great experience for your visitors.',
    }
  ]
  
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">MyMusicMagic</h1>
          <Link
              href="/auth/signin"
              className="px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all duration-300"
            >
              Sign In
            </Link>
        </div>
      </header>
      
      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-28">
         <div className="absolute inset-0 bottom-1/2 bg-indigo-50" />
        <div className="relative text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Your Music, Your Stage.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Create a stunning, professional portfolio in minutes. Showcase your music, share your story, and connect with your audience.
          </p>
          
          <Link
            href="/auth/signup"
            className="inline-flex items-center bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Create Your Portfolio
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>

          <p className="mt-4 text-sm text-gray-500">Free to start, no credit card required.</p>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Everything you need to stand out
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
              Powerful features to make your portfolio as unique as your music.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl ">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-50">
        <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Star className="w-10 h-10 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
                "MyMusicMagic gave me the professional look I needed. It's simple, powerful, and my fans love it!"
            </h2>
            <p className="mt-4 text-gray-600 font-medium">— Alex Rivera, Independent Artist</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Ready to build your presence?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who trust us to showcase their work professionally.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center bg-indigo-600 text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Get Started For Free
            <ArrowRight className="w-6 h-6 ml-3" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} MyMusicMagic. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
} 