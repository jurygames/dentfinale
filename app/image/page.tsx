"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function ImagePage() {
  const router = useRouter()

  // Set up black background for this page only
  useEffect(() => {
    // Save original styles
    const originalBodyBg = document.body.style.backgroundColor
    const originalBodyOverflow = document.body.style.overflow
    const originalHtmlBg = document.documentElement.style.backgroundColor
    
    // Force black background and prevent scrolling
    document.body.style.backgroundColor = '#000000'
    document.body.style.overflow = 'hidden'
    document.documentElement.style.backgroundColor = '#000000'
    
    // Create a black overlay to cover any potential gaps
    const blackOverlay = document.createElement('div')
    blackOverlay.id = 'image-black-overlay'
    blackOverlay.style.position = 'fixed'
    blackOverlay.style.top = '0'
    blackOverlay.style.left = '0'
    blackOverlay.style.width = '100vw'
    blackOverlay.style.height = '100vh'
    blackOverlay.style.backgroundColor = '#000000'
    blackOverlay.style.zIndex = '-1'
    document.body.appendChild(blackOverlay)
    
    return () => {
      // Restore original styles when component unmounts
      document.body.style.backgroundColor = originalBodyBg
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.backgroundColor = originalHtmlBg
      
      // Remove the black overlay
      if (document.getElementById('image-black-overlay')) {
        document.body.removeChild(document.getElementById('image-black-overlay')!)
      }
    }
  }, [])

  // Add keyboard listener for navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Any key press navigates back to home
      router.push('/')
    }

    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [router])

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="relative w-full h-full">
        <Image
          src="/briefing.png"
          alt="Full screen display"
          fill
          className="object-contain"
          priority
          quality={100}
        />
      </div>
      
      <style jsx global>{`
        /* Ensure the entire page has a black background */
        html, body, #__next, main, div {
          background-color: #000000 !important;
        }
        
        /* Hide any scrollbars */
        ::-webkit-scrollbar {
          display: none !important;
        }
        
        /* Ensure no margins or padding */
        body {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
      `}</style>
    </div>
  )
} 