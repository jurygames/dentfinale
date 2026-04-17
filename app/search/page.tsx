"use client"

import { useEffect, useState, useRef } from "react"
import { Loader2 } from "lucide-react"
import Image from "next/image"

// Generate a pool of actual search images
// Using a larger pool with more variation
const searchImages = Array.from({ length: 30 }, (_, i) => `/search-images/person-${(i % 15) + 1}.jpg`)

// Preload images to ensure smooth cycling
const preloadImages = () => {
  searchImages.forEach((src) => {
    const img = document.createElement('img')
    img.src = src
  })
}

export default function SearchPage() {
  // Core state
  const [isSearching, setIsSearching] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  
  // Animation states for match found
  const [showMatchFlash, setShowMatchFlash] = useState(false)
  const [showMatchDetails, setShowMatchDetails] = useState(false)
  const [showSubjectInfo, setShowSubjectInfo] = useState(false)
  const [showStatusInfo, setShowStatusInfo] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)

  // Sound refs
  const scanSoundRef = useRef<HTMLAudioElement | null>(null)
  const matchSoundRef = useRef<HTMLAudioElement | null>(null)
  const alertSoundRef = useRef<HTMLAudioElement | null>(null)

  // Additional state for UI elements
  const [scanningText, setScanningText] = useState("Initializing facial recognition...")
  const [scanStats, setScanStats] = useState({
    records: 0,
    confidence: 0,
    matches: 0,
  })

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesScannedRef = useRef(0)
  const imageRef = useRef<HTMLImageElement>(null)

  // Initialize audio elements
  useEffect(() => {
    // Create audio elements
    scanSoundRef.current = new Audio("/sounds/scanning.wav")
    matchSoundRef.current = new Audio("/sounds/match-found.wav")
    alertSoundRef.current = new Audio("/sounds/alert.wav")
    
    // Configure audio elements
    if (scanSoundRef.current) {
      scanSoundRef.current.loop = true
      scanSoundRef.current.volume = 0.3
    }
    
    if (matchSoundRef.current) {
      matchSoundRef.current.volume = 0.7
    }
    
    if (alertSoundRef.current) {
      alertSoundRef.current.volume = 0.5
    }
    
    // Start scanning sound
    const playScanSound = () => {
      if (scanSoundRef.current) {
        scanSoundRef.current.play().catch(e => {
          console.log("Audio play failed:", e)
          // Try again after user interaction
          document.addEventListener('click', () => {
            scanSoundRef.current?.play().catch(e => console.log("Audio still failed:", e))
          }, { once: true })
        })
      }
    }
    
    // Try to play sound
    playScanSound()
    
    // Cleanup function
    return () => {
      if (scanSoundRef.current) scanSoundRef.current.pause()
      if (matchSoundRef.current) matchSoundRef.current.pause()
      if (alertSoundRef.current) alertSoundRef.current.pause()
    }
  }, [])

  // Preload images on component mount
  useEffect(() => {
    preloadImages()
  }, [])

  // Effect for the 7-second search timer
  useEffect(() => {
    console.log("Setting up search timer")

    const timer = setTimeout(() => {
      console.log("Search timer completed")
      setIsSearching(false)
      
      // Stop scanning sound and play match found sound
      if (scanSoundRef.current) {
        scanSoundRef.current.pause()
      }
      
      // Try to play match found sound
      if (matchSoundRef.current) {
        matchSoundRef.current.play().catch(e => {
          console.log("Match sound failed:", e)
        })
      }
      
      // Start the match found animation sequence
      setShowMatchFlash(true)
      
      // Sequence of animations
      setTimeout(() => setShowMatchDetails(true), 1200)
      setTimeout(() => setShowSubjectInfo(true), 2000)
      setTimeout(() => {
        setShowStatusInfo(true)
        // Play alert sound when status is shown
        if (alertSoundRef.current) {
          alertSoundRef.current.play().catch(e => {
            console.log("Alert sound failed:", e)
          })
        }
      }, 2800)
      setTimeout(() => setScanComplete(true), 3500)
      
    }, 7000)

    return () => {
      console.log("Clearing search timer")
      clearTimeout(timer)
    }
  }, [])

  // Effect for progress bar
  useEffect(() => {
    if (!isSearching) {
      setProgress(100)
      return
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / 70 // 7 seconds to reach 100%
        return Math.min(newProgress, 99) // Cap at 99% until complete
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isSearching])

  // Effect for cycling through images rapidly
  useEffect(() => {
    if (!isSearching) return

    // Use a faster interval for more visible cycling
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        // Ensure we're getting a different image each time
        const newIndex = (prev + 1 + Math.floor(Math.random() * 5)) % searchImages.length
        imagesScannedRef.current += 1
        return newIndex
      })
    }, 150) // Faster cycling but still visible to the human eye

    return () => clearInterval(interval)
  }, [isSearching])

  // Effect for updating scan stats
  useEffect(() => {
    if (!isSearching) return

    const interval = setInterval(() => {
      setScanStats((prev) => ({
        records: prev.records + Math.floor(Math.random() * 1000) + 500,
        confidence: Math.min(99.9, prev.confidence + Math.random() * 5),
        matches: Math.min(5, prev.matches + (Math.random() > 0.7 ? 1 : 0)),
      }))
    }, 500)

    return () => clearInterval(interval)
  }, [isSearching])

  // Effect for changing scanning text
  useEffect(() => {
    if (!isSearching) return

    const scanningTexts = [
      "Initializing facial recognition...",
      "Accessing UCN database...",
      "Scanning biometric markers...",
      "Cross-referencing identities...",
      "Analyzing facial structure...",
      "Processing neural patterns...",
      "Matching genetic profiles...",
    ]

    const interval = setInterval(() => {
      setScanningText(scanningTexts[Math.floor(Math.random() * scanningTexts.length)])
    }, 1500)

    return () => clearInterval(interval)
  }, [isSearching])

  // Canvas animation for scanning effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Grid pattern
      ctx.strokeStyle = "rgba(0, 255, 255, 0.2)"
      ctx.lineWidth = 1

      // Horizontal lines
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Vertical lines
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Scanning line
      const time = Date.now() / 1000
      const scanY = (Math.sin(time) * 0.5 + 0.5) * canvas.height

      ctx.strokeStyle = "rgba(0, 255, 255, 0.8)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, scanY)
      ctx.lineTo(canvas.width, scanY)
      ctx.stroke()

      // Glow effect
      ctx.shadowColor = "rgba(0, 255, 255, 0.5)"
      ctx.shadowBlur = 10

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="min-h-screen bg-scifi-dark text-white flex flex-col font-exo2 overflow-hidden relative">
      {/* Audio elements for browsers that don't support the Audio API */}
      <audio id="scan-sound" src="/sounds/scanning.wav" loop preload="auto" />
      <audio id="match-sound" src="/sounds/match-found.wav" preload="auto" />
      
      {/* Scanline effect */}
      <div className="scanline"></div>

      {/* Background grid */}
      <div className="absolute inset-0 sci-fi-grid opacity-30 pointer-events-none"></div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-4xl">
          <h1 className="text-4xl font-bold mb-4 text-center tracking-wider glow-text text-scifi-light">
            UCN DATABASE <span className="text-white">SEARCH</span>
          </h1>

          {isSearching ? (
            <>
              <div className="text-center mb-6">
                <p className="text-xl mb-2 typing-effect mx-auto">{scanningText}</p>
                <div className="flex items-center justify-center gap-2 text-scifi-light">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>PROCESSING</span>
                </div>
              </div>

              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-scifi-light/30 relative overflow-hidden">
                {/* Canvas overlay for scanning effect */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
                  width={800}
                  height={600}
                />

                <div className="grid grid-cols-2 gap-6 mb-6 relative z-10">
                  <div className="aspect-square bg-black/70 rounded-md overflow-hidden border border-scifi-light/50 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full relative">
                        <img
                          src="/target-subject.jpg"
                          alt="Target subject"
                          className="w-full h-full object-cover"
                        />
                        {/* Scanning overlay */}
                        <div className="absolute inset-0 border-2 border-scifi-light/70 pulse"></div>

                        {/* Corner brackets */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-scifi-light"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-scifi-light"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-scifi-light"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-scifi-light"></div>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 text-xs text-scifi-light">TARGET</div>
                  </div>

                  <div className="aspect-square bg-black/70 rounded-md overflow-hidden border border-scifi-light/50 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full relative">
                        <img
                          ref={imageRef}
                          key={currentImageIndex} // Add key to force re-render
                          src={searchImages[currentImageIndex]}
                          alt="Searching database"
                          className="w-full h-full object-cover"
                        />
                        {/* Scanning overlay */}
                        <div className="absolute inset-0 border-2 border-scifi-warning/70 pulse"></div>

                        {/* Corner brackets */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-scifi-warning"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-scifi-warning"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-scifi-warning"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-scifi-warning"></div>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 text-xs text-scifi-warning">
                      SCANNING
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 text-xs text-scifi-warning">
                      {imagesScannedRef.current} SCANNED
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-scifi-light">SEARCH PROGRESS</span>
                    <span className="font-mono">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-black/50 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-scifi-light h-2.5 rounded-full transition-all duration-100 glow"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 text-xs">
                  <div className="bg-black/30 p-3 rounded border border-scifi-light/20">
                    <div className="text-scifi-light mb-1">RECORDS SCANNED</div>
                    <div className="font-mono text-lg flicker">{scanStats.records.toLocaleString()}</div>
                  </div>
                  <div className="bg-black/30 p-3 rounded border border-scifi-light/20">
                    <div className="text-scifi-light mb-1">CONFIDENCE</div>
                    <div className="font-mono text-lg flicker">{scanStats.confidence.toFixed(1)}%</div>
                  </div>
                  <div className="bg-black/30 p-3 rounded border border-scifi-light/20">
                    <div className="text-scifi-light mb-1">POTENTIAL MATCHES</div>
                    <div className="font-mono text-lg flicker">{scanStats.matches}</div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-scifi-light/70 font-mono space-y-1">
                <p className="flicker">SYSTEM: QUANTUM BIOMETRIC ENGINE v4.7.2</p>
                <p className="flicker">ACCESS LEVEL: CLASSIFIED // SECURITY CLEARANCE <span className="text-red-500">SCARLET</span></p>
                <p className="flicker">CONNECTION: SECURE // ENCRYPTED // 256-BIT</p>
              </div>
            </>
          ) : (
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-scifi-success/50 relative overflow-hidden">
              <div className="absolute inset-0 sci-fi-grid opacity-20"></div>
              
              {/* Flash animation when match is found */}
              {showMatchFlash && (
                <div className={`absolute inset-0 bg-scifi-success/30 z-20 match-flash-animation ${showMatchDetails ? 'opacity-0' : ''}`}></div>
              )}

              <div className="text-center mb-6 relative z-10">
                <h2 className={`text-3xl font-bold text-scifi-success tracking-widest glow-text match-text-animation ${showMatchDetails ? 'opacity-100' : 'opacity-0'}`}>
                  MATCH FOUND
                </h2>
                <p className={`text-scifi-light fade-in-animation ${showMatchDetails ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '300ms'}}>
                  Subject identified in UCN database
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center relative z-10">
                <div className={`w-full md:w-1/2 transition-all duration-1000 ease-in-out ${showSubjectInfo ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                  <div className="relative">
                    <div className="aspect-square overflow-hidden rounded-md border-2 border-scifi-success">
                      <Image
                        src="/cobalt.jpg"
                        alt="Dieter Cobalt"
                        width={600}
                        height={600}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Scanning overlay with animated pulse */}
                    <div className="absolute inset-0 border-2 border-scifi-success pulse"></div>

                    {/* Corner brackets with animation */}
                    <div className={`absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-scifi-success bracket-animation ${showSubjectInfo ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '200ms'}}></div>
                    <div className={`absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-scifi-success bracket-animation ${showSubjectInfo ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '400ms'}}></div>
                    <div className={`absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-scifi-success bracket-animation ${showSubjectInfo ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '600ms'}}></div>
                    <div className={`absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-scifi-success bracket-animation ${showSubjectInfo ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '800ms'}}></div>

                    {/* Status indicator with animation */}
                    <div className={`absolute -top-3 -right-3 bg-scifi-success text-black px-3 py-1 text-xs font-bold rounded fade-in-animation ${showSubjectInfo ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '1000ms'}}>
                      VERIFIED
                    </div>
                  </div>
                </div>

                <div className={`w-full md:w-1/2 space-y-6 transition-all duration-1000 ease-in-out ${showSubjectInfo ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                  <div className="bg-black/30 p-4 rounded border border-scifi-light/30 slide-in-animation" style={{transitionDelay: '300ms'}}>
                    <h3 className="text-xs text-scifi-light mb-1">NAME</h3>
                    <p className="text-2xl font-mono tracking-wider">DIETER COBALT</p>
                    <p className="text-lg font-mono text-scifi-light/80">(LT. CMDR.)</p>
                  </div>

                  <div className={`grid grid-cols-2 gap-4 transition-all duration-500 ${showStatusInfo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                    <div className="bg-black/30 p-3 rounded border border-scifi-light/30 slide-in-animation" style={{transitionDelay: '500ms'}}>
                      <h3 className="text-xs text-scifi-light mb-1">ID NUMBER</h3>
                      <p className="text-lg font-mono">UCN-7842-39A</p>
                    </div>

                    <div className="bg-black/30 p-3 rounded border border-scifi-light/30 slide-in-animation" style={{transitionDelay: '700ms'}}>
                      <h3 className="text-xs text-scifi-light mb-1">STATUS</h3>
                      <p className="text-lg font-mono text-scifi-danger blink-animation">AWOL</p>
                    </div>
                  </div>

                  <div className={`grid grid-cols-2 gap-4 transition-all duration-500 ${showStatusInfo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                    <div className="bg-black/30 p-3 rounded border border-scifi-light/30 slide-in-animation" style={{transitionDelay: '900ms'}}>
                      <h3 className="text-xs text-scifi-light mb-1">MATCH CONFIDENCE</h3>
                      <p className="text-lg font-mono">98.7%</p>
                    </div>

                    <div className="bg-black/30 p-3 rounded border border-scifi-danger/30 slide-in-animation" style={{transitionDelay: '1100ms'}}>
                      <h3 className="text-xs text-scifi-light mb-1">CLEARANCE</h3>
                      <p className="text-lg font-mono text-scifi-danger blink-animation"><span className="text-red-500 font-bold">SCARLET</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`mt-6 pt-6 border-t border-scifi-light/20 relative z-10 transition-all duration-500 ${scanComplete ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-scifi-light/70 font-mono">
                    SEARCH COMPLETED AT {new Date().toLocaleTimeString()}
                  </p>
                  <div className="text-xs px-3 py-1 bg-scifi-danger/20 rounded-full border border-scifi-danger/30 pulse">
                    ALERT: HIGH PRIORITY TARGET
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-scifi-light/70 font-mono text-center mt-6">
            <p className="flicker">
              UNITED CONFEDERATION SHIPS NETWORK • CLASSIFIED <span className="text-red-500">SCARLET LEVEL</span> • AUTHORIZED PERSONNEL ONLY
            </p>
          </div>
        </div>
      </div>
      
      {/* Add CSS for animations */}
      <style jsx>{`
        .match-flash-animation {
          animation: flash 1.2s ease-out;
        }
        
        .match-text-animation {
          animation: glitch 1s ease-in-out;
          transition: opacity 0.5s ease-in-out;
        }
        
        .fade-in-animation {
          transition: opacity 0.8s ease-in-out, transform 0.8s ease-in-out;
        }
        
        .slide-in-animation {
          opacity: 0;
          transform: translateY(10px);
          animation: slideIn 0.5s forwards;
        }
        
        .bracket-animation {
          transition: opacity 0.3s ease-in-out;
        }
        
        .blink-animation {
          animation: blink 2s infinite;
        }
        
        @keyframes flash {
          0%, 20%, 40% { background-color: rgba(0, 255, 128, 0.7); }
          10%, 30%, 50% { background-color: rgba(0, 255, 128, 0); }
          100% { background-color: rgba(0, 255, 128, 0); }
        }
        
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-5px, 5px); }
          40% { transform: translate(-5px, -5px); }
          60% { transform: translate(5px, 5px); }
          80% { transform: translate(5px, -5px); }
          100% { transform: translate(0); }
        }
        
        @keyframes slideIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}
