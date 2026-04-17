"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"

export default function VideoPage() {
  const [videoEnded, setVideoEnded] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const router = useRouter()

  // Listen for messages from the iframe (for video end event)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check if the message is from Vimeo
      if (event.origin.includes('vimeo.com')) {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
          
          // Check if the video loaded
          if (data.event === 'ready') {
            console.log('Video ready')
            setVideoLoaded(true)
          }
          
          // Check if the video ended
          if (data.event === 'ended') {
            console.log('Video ended')
            setVideoEnded(true)
            
            // Ensure document has focus
            document.body.focus()
            
            // Automatically navigate back to home page after 3 seconds
            setTimeout(() => {
              router.push('/')
            }, 3000)
          }
        } catch (e) {
          console.error('Error parsing message from Vimeo:', e)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [router])

  // Add a keyboard listener specifically for this page
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (videoEnded) {
        // If video has ended, any key press navigates home immediately
        router.push('/')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [videoEnded, router])

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
    blackOverlay.id = 'video-black-overlay'
    blackOverlay.style.position = 'fixed'
    blackOverlay.style.top = '0'
    blackOverlay.style.left = '0'
    blackOverlay.style.width = '100vw'
    blackOverlay.style.height = '100vh'
    blackOverlay.style.backgroundColor = '#000000'
    blackOverlay.style.zIndex = '-1'
    document.body.appendChild(blackOverlay)
    
    // Preload the video using the Vimeo API
    const script = document.createElement('script')
    script.src = 'https://player.vimeo.com/api/player.js'
    script.async = true
    document.body.appendChild(script)
    
    return () => {
      // Restore original styles when component unmounts
      document.body.style.backgroundColor = originalBodyBg
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.backgroundColor = originalHtmlBg
      
      // Remove the black overlay
      if (document.getElementById('video-black-overlay')) {
        document.body.removeChild(document.getElementById('video-black-overlay')!)
      }
      
      // Remove the script
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black">
      {!videoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-white text-center">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading video...</p>
          </div>
        </div>
      )}
       /* URL here */
      <div className="absolute inset-0 bg-black">
        <iframe
          ref={iframeRef}
          src="https://player.vimeo.com/video/1110696867?autoplay=1&loop=1&controls=0&title=0&byline=0&portrait=0&preload=auto&background=1&quality=auto&color=000000"
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            opacity: videoLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease',
            backgroundColor: '#000000'
          }}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>

      {videoEnded && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-4 rounded-md">
          <p className="text-lg font-medium">Video playback complete</p>
          <p>Returning to data transfer in 3 seconds... Press any key to return immediately</p>
        </div>
      )}
      
      <style jsx global>{`
        /* Ensure the entire page has a black background */
        html, body, #__next, main, div {
          background-color: #000000 !important;
        }
        
        /* Remove any potential white flashes */
        iframe {
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

