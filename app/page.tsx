"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { AlertTriangle, Maximize2, Server, Shield, Ship, Wifi } from "lucide-react"

type Phase = "hammerdown" | "pre_glitch" | "activating" | "running"
type CountermandStage = "none" | "failed" | "ordered"

export default function HomePage() {
  const [phase, setPhase] = useState<Phase>("hammerdown")
  const [introGlitch, setIntroGlitch] = useState(false)
  const [glitchActive, setGlitchActive] = useState(false)
  const [countermandStage, setCountermandStage] = useState<CountermandStage>("none")
  const [countermandFlashOn, setCountermandFlashOn] = useState(true)
  const [countermandCompleted, setCountermandCompleted] = useState(false)
  const [winedarkTakeoverActive, setWinedarkTakeoverActive] = useState(false)
  const [winedarkVideoLoaded, setWinedarkVideoLoaded] = useState(false)

  const [downloadProgress, setDownloadProgress] = useState(0)
  const [dataTransferred, setDataTransferred] = useState(0)
  const [transferSpeed, setTransferSpeed] = useState(88)
  const [securityStatus, setSecurityStatus] = useState("SECURE")
  const [connectionStrength, setConnectionStrength] = useState(98)
  const [logMessages, setLogMessages] = useState<string[]>([
    "FBMS image staged for deployment.",
    "Star-of-Life med-bay authority seal verified.",
    "Awaiting command input on channel SPACEBAR.",
  ])

  const [vesselErrors, setVesselErrors] = useState({
    warspite: false,
    falchion: false,
    vikrant: false,
    scarab: false,
  })

  const isMountedRef = useRef(true)
  const timersRef = useRef<NodeJS.Timeout[]>([])
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const logIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const countermandIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const schedule = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay)
    timersRef.current.push(id)
  }

  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      // Ignore browser/fullscreen permission errors.
    }
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && phase === "running" && countermandStage === "none" && !countermandCompleted) {
        event.preventDefault()
        setCountermandStage("failed")
        setCountermandFlashOn(false)
        setSecurityStatus("ALERT")
        setLogMessages((prev) => [
          ...prev,
          "Countermand failed: Order and countermand have same source.",
        ])

        // After 4 seconds, escalate to Greene lock screen.
        schedule(() => {
          if (!isMountedRef.current) return
          setCountermandStage("ordered")
          setCountermandFlashOn(true)
          setLogMessages((prev) => [
            ...prev,
            "UPGRADE ORDERED BY CMDR. DR. K. GEENE",
            "GENETIC LOCK DETECTED",
          ])

          countermandIntervalRef.current = setInterval(() => {
            setCountermandFlashOn((v) => !v)
            setLogMessages((prev) => [...prev.slice(-13), "GENETIC LOCK DETECTED"])
          }, 450)

          // Keep Greene stage visible for 7 seconds before allowing video trigger.
          schedule(() => {
            if (countermandIntervalRef.current) clearInterval(countermandIntervalRef.current)
            setCountermandStage("none")
            setCountermandFlashOn(true)
            setCountermandCompleted(true)
            setSecurityStatus("SECURE")
            setLogMessages((prev) => [...prev, "Genetic lock phase complete. Firmware flash resumed."])
          }, 7000)
        }, 4000)
        return
      }

      if (event.code !== "Space" || phase !== "hammerdown") return
      event.preventDefault()

      setPhase("pre_glitch")
      setLogMessages((prev) => [
        ...prev,
        "Command accepted. Stand by for pre-update integrity check.",
      ])

      schedule(() => {
        if (!isMountedRef.current) return
        setIntroGlitch(true)
      }, 3000)

      schedule(() => {
        if (!isMountedRef.current) return
        setIntroGlitch(false)
        setPhase("activating")
      }, 4600)

      schedule(() => {
        if (!isMountedRef.current) return
        setPhase("running")
        setLogMessages((prev) => [
          ...prev,
          "ACTIVATING UPDATE...",
          "FBMS firmware execution channel opened.",
          "Med-bay scanner lattice is now calibrating.",
        ])
      }, 7600)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [phase, countermandStage, countermandCompleted])

  useEffect(() => {
    if (phase !== "running" || glitchActive) return

    progressIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) return

      setDownloadProgress((prev) => {
        if (countermandStage !== "none") return prev

        const next = prev + 0.23
        if (prev < 61.8 && next >= 61.8 && !glitchActive) {
          setGlitchActive(true)
          setSecurityStatus("ALERT")
          setLogMessages((logs) => [
            ...logs,
            "WARNING: Genome-locked process hijack detected.",
            "ERROR: FBMS flash process frozen at 61.8%.",
            "VIRAL AUTONOMY CASCADE DETECTED.",
          ])

          schedule(() => {
            setVesselErrors((s) => ({ ...s, warspite: true }))
            setLogMessages((logs) => [...logs, "ERROR: UCS WARSPITE med-bay uplink lost."])
          }, 500)
          schedule(() => {
            setVesselErrors((s) => ({ ...s, falchion: true }))
            setLogMessages((logs) => [...logs, "ERROR: UCS FALCHION link dropped."])
          }, 1300)
          schedule(() => {
            setVesselErrors((s) => ({ ...s, vikrant: true }))
            setLogMessages((logs) => [...logs, "ERROR: UCS VIKRANT link dropped."])
          }, 2100)
          schedule(() => {
            setVesselErrors((s) => ({ ...s, scarab: true }))
            setLogMessages((logs) => [...logs, "ERROR: UCS SCARAB offline."])
          }, 2900)

          // Trigger the in-place Winedark takeover 3 seconds after glitch start.
          schedule(() => {
            if (!isMountedRef.current) return
            setLogMessages((logs) => [...logs, "WINEDARK DAEMON SIGNAL ACQUIRED"])
            setWinedarkTakeoverActive(true)
          }, 3000)

          return 61.8
        }

        if (glitchActive) return 61.8
        return Math.min(98.8, next)
      })

      if (countermandStage !== "none" || glitchActive) return

      setDataTransferred((prev) => prev + Math.random() * 2.2)
      setTransferSpeed((prev) => Math.max(74, Math.min(128, prev + (Math.random() * 10 - 5))))
      setConnectionStrength((prev) => Math.max(92, Math.min(100, prev + (Math.random() * 2 - 1))))
    }, 60)

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [phase, glitchActive, countermandStage, countermandCompleted])

  useEffect(() => {
    if (phase !== "running" || glitchActive || countermandStage !== "none") return

    const messages = [
      "Syncing autonomous triage scanner firmware...",
      "Cross-validating med-bay quantum sonography matrices...",
      "Enhancing trauma pod nanocyte routing maps...",
      "Reindexing sterile field resonator coordinates...",
      "Rebuilding whole-crew bioelectric baseline models...",
      "Optimizing emergency gene-edit lockouts...",
      "Clinical biometric checksum passed...",
    ]

    logIntervalRef.current = setInterval(() => {
      const newMessage = messages[Math.floor(Math.random() * messages.length)]
      setLogMessages((prev) => [...prev.slice(-13), newMessage])
    }, 1800)

    return () => {
      if (logIntervalRef.current) clearInterval(logIntervalRef.current)
    }
  }, [phase, glitchActive, countermandStage])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      timersRef.current.forEach((t) => clearTimeout(t))
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      if (logIntervalRef.current) clearInterval(logIntervalRef.current)
      if (countermandIntervalRef.current) clearInterval(countermandIntervalRef.current)
    }
  }, [])

  if (phase === "hammerdown" || phase === "pre_glitch") {
    return (
      <div className={`min-h-screen bg-black text-white flex items-center justify-center relative ${introGlitch ? "intro-glitch" : ""}`}>
        <button
          onClick={enterFullscreen}
          className="absolute top-4 right-4 z-20 inline-flex items-center gap-2 rounded border border-cyan-300/60 bg-black/70 px-3 py-2 text-xs font-mono tracking-wider text-cyan-100 hover:bg-black/90"
        >
          <Maximize2 className="h-4 w-4" /> FULL SCREEN
        </button>
        <Image src="/HAMMERDOWN.png" alt="HAMMERDOWN" fill className="object-contain opacity-95" priority />
        <div className="relative z-10 text-center px-6">
          {phase === "pre_glitch" && (
            <p className="mt-4 text-red-300 font-mono animate-pulse">AUTH TOKEN ACCEPTED. HOLD POSITION...</p>
          )}
        </div>
        {introGlitch && <div className="absolute inset-0 bg-red-600/25 animate-pulse pointer-events-none" />}
      </div>
    )
  }

  if (phase === "activating") {
    return (
      <div className="min-h-screen bg-scifi-dark text-white flex flex-col items-center justify-center relative overflow-hidden">
        <button
          onClick={enterFullscreen}
          className="absolute top-4 right-4 z-20 inline-flex items-center gap-2 rounded border border-cyan-300/60 bg-black/70 px-3 py-2 text-xs font-mono tracking-wider text-cyan-100 hover:bg-black/90"
        >
          <Maximize2 className="h-4 w-4" /> FULL SCREEN
        </button>
        <div className="scanline" />
        <div className="absolute inset-0 sci-fi-grid opacity-40" />
        <div className="relative z-10 text-center">
          <p className="text-cyan-200/80 font-mono tracking-[0.4em] text-xs md:text-sm">FBMS BOOTSTRAP</p>
          <h1 className="text-4xl md:text-6xl font-bold text-scifi-light mt-4 glow-text">ACTIVATING UPDATE</h1>
          <p className="mt-5 text-cyan-100/80 font-mono">Initializing med-bay scanner harmonics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-scifi-dark text-white flex flex-col font-exo2 overflow-hidden relative ${glitchActive && !winedarkTakeoverActive ? "virus-glitch" : ""}`}>
      <button
        onClick={enterFullscreen}
        className="absolute top-4 right-4 z-40 inline-flex items-center gap-2 rounded border border-cyan-300/60 bg-black/70 px-3 py-2 text-xs font-mono tracking-wider text-cyan-100 hover:bg-black/90"
      >
        <Maximize2 className="h-4 w-4" /> FULL SCREEN
      </button>
      <div className="scanline" />
      <div className="absolute inset-0 sci-fi-grid opacity-30 pointer-events-none" />

      {glitchActive && <div className="absolute inset-0 bg-red-600/20 mix-blend-screen animate-pulse z-20 pointer-events-none" />}

      <div className="flex-1 flex flex-col p-4 relative z-10">
        <div className="text-center mb-6 relative">
          <h1 className="text-4xl font-bold tracking-wider glow-text text-scifi-light">
            FBMS FIRMWARE <span className="text-white">UPDATE</span>
          </h1>
          <p className="text-lg text-scifi-light/80 mt-2">UCS WARSPITE • BIOMEDICAL SYSTEMS CONTROL</p>
          <div className="mt-4 flex justify-center">
            <Image
              src="/star-of-life.png"
              alt="Star of Life Medical Symbol"
              width={150}
              height={150}
              className="drop-shadow-[0_0_20px_rgba(44,255,240,0.75)]"
              priority
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 border border-scifi-light/30 relative overflow-hidden">
            <h2 className="text-xl font-bold mb-4 text-scifi-light flex items-center">
              <Ship className="mr-2 h-5 w-5" /> VESSEL STATUS
            </h2>

            <div className="space-y-4 text-xs text-scifi-light/80">
              <div className="bg-black/30 p-3 rounded border border-scifi-light/20">
                <p>UCS WARSPITE: {vesselErrors.warspite ? "CONNECTION LOST" : "MED-BAY LINK STABLE"}</p>
              </div>
              <div className="bg-black/30 p-3 rounded border border-scifi-light/20">
                <p>UCS FALCHION: {vesselErrors.falchion ? "CONNECTION LOST" : "STANDBY"}</p>
              </div>
              <div className="bg-black/30 p-3 rounded border border-scifi-light/20">
                <p>UCS VIKRANT: {vesselErrors.vikrant ? "CONNECTION LOST" : "LINKED"}</p>
              </div>
              <div className="bg-black/30 p-3 rounded border border-scifi-light/20">
                <p>UCS SCARAB: {vesselErrors.scarab ? "CONNECTION LOST" : "MAINTENANCE"}</p>
              </div>
              <div className="bg-black/30 p-3 rounded border border-scifi-light/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  <span>CONNECTION</span>
                </div>
                <span>{glitchActive ? "0.0%" : `${connectionStrength.toFixed(1)}%`}</span>
              </div>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 border border-scifi-light/30 relative overflow-hidden lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-scifi-light flex items-center">
              <Server className="mr-2 h-5 w-5" /> FBMS FIRMWARE UPDATE
            </h2>

            <div className="relative h-40 mb-4 border border-scifi-light/20 rounded overflow-hidden bg-black/40">
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-scifi-light">{dataTransferred.toFixed(1)} TB</div>
                  <div className="text-sm text-scifi-light/70">FIRMWARE FLASHED</div>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-scifi-light">UCS WARSPITE MED-BAY CORE</div>
              <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-scifi-light">FBMS CLINICAL BACKPLANE</div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-scifi-light">FLASH PROGRESS</span>
                  <span className="font-mono">{downloadProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-scifi-light h-2.5 rounded-full transition-all duration-100 glow" style={{ width: `${downloadProgress}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="bg-black/30 p-3 rounded border border-scifi-light/20">
                  <div className="text-scifi-light mb-1">UPDATE THROUGHPUT</div>
                  <div className="font-mono text-lg">{glitchActive ? "0.0 MB/s" : `${transferSpeed.toFixed(1)} MB/s`}</div>
                </div>
                <div className="bg-black/30 p-3 rounded border border-scifi-light/20">
                  <div className="text-scifi-light mb-1">SECURITY</div>
                  <div className={`font-mono text-lg ${securityStatus === "ALERT" ? "text-red-400" : "text-scifi-success"}`}>
                    {securityStatus}
                  </div>
                </div>
                <div className="bg-black/30 p-3 rounded border border-scifi-light/20">
                  <div className="text-scifi-light mb-1">ENCRYPTION</div>
                  <div className="font-mono text-lg">QUANTUM</div>
                </div>
              </div>

              <div className="bg-black/30 p-3 rounded border border-scifi-light/20 h-48 overflow-y-auto">
                <div className="text-xs text-scifi-light mb-2 flex items-center">
                  <Shield className="h-3 w-3 mr-1" /> BIOMED LOG
                </div>
                <div className="space-y-1 font-mono text-xs">
                  {logMessages.slice(-15).map((message, index) => (
                    <p key={index} className="text-scifi-light/80">
                      <span className="text-scifi-light">[{new Date().toLocaleTimeString()}]</span> {message}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-scifi-light/70 font-mono text-center">
          <p>UNITED CONFEDERATION NETWORK • CLASSIFIED SCARLET LEVEL • AUTHORIZED PERSONNEL ONLY</p>
        </div>
      </div>

      {countermandStage !== "none" && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 ${countermandStage === "ordered" && countermandFlashOn ? "countermand-flash" : ""}`}>
          <div className="w-full max-w-3xl border-2 border-red-500 bg-black/95 shadow-[0_0_30px_rgba(255,0,0,0.8)] rounded-lg p-5 text-center">
            <div className="flex items-center justify-center mb-3 text-red-400">
              <AlertTriangle className="mr-2" />
              <span className="font-mono tracking-widest">SECURITY OVERRIDE</span>
            </div>
            {countermandStage === "failed" ? (
              <h2 className="text-3xl md:text-5xl font-black text-red-500 tracking-wide">
                Countermand failed: Order and countermand have same source
              </h2>
            ) : (
              <>
                <h2 className="text-3xl md:text-5xl font-black text-red-500 tracking-wide">UPGRADE ORDERED BY CMDR. DR. K. GEENE</h2>
                <div className="mt-4 flex justify-center">
                  <Image
                    src="/greene.png"
                    alt="CMDR. DR. K. GREENE"
                    width={230}
                    height={230}
                    className="rounded border border-red-500 object-cover"
                    priority
                  />
                </div>
                <p className="mt-4 text-2xl md:text-3xl font-bold text-red-400 animate-pulse">GENETIC LOCK DETECTED</p>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .intro-glitch {
          animation: introGlitch 0.12s infinite;
          filter: saturate(1.6) contrast(1.2);
        }

        .virus-glitch {
          animation: virusGlitch 0.15s infinite;
          filter: saturate(1.6) contrast(1.25) hue-rotate(-12deg);
        }

        .countermand-flash {
          animation: countermandPulse 0.2s infinite;
        }

        @keyframes introGlitch {
          0% { transform: translate(0, 0); }
          25% { transform: translate(5px, -3px); }
          50% { transform: translate(-4px, 3px); }
          75% { transform: translate(4px, 4px); }
          100% { transform: translate(0, 0); }
        }

        @keyframes virusGlitch {
          0% { transform: translate(0, 0) skew(0deg); }
          25% { transform: translate(8px, -5px) skew(4deg); }
          50% { transform: translate(-7px, 5px) skew(-5deg); }
          75% { transform: translate(5px, 6px) skew(3deg); }
          100% { transform: translate(0, 0) skew(0deg); }
        }

        @keyframes countermandPulse {
          0%, 100% { background-color: rgba(0, 0, 0, 0.7); }
          50% { background-color: rgba(60, 0, 0, 0.82); }
        }
      `}</style>

      {winedarkTakeoverActive && (
        <div className="fixed inset-0 z-[80] bg-black winedark-enter overflow-hidden">
          {!winedarkVideoLoaded && (
            <div className="absolute inset-0 z-[95] grid place-items-center bg-black">
              <div className="text-center">
                <div className="mx-auto mb-4 h-14 w-14 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
                <p className="font-mono text-red-300 tracking-wider">MOUNTING WINEDARK DAEMON...</p>
              </div>
            </div>
          )}

          <iframe
            src="https://player.vimeo.com/video/1110696867?autoplay=1&loop=1&controls=0&title=0&byline=0&portrait=0&preload=auto&background=1&quality=auto&color=000000"
            className="absolute inset-0 h-full w-full bg-black"
            style={{
              opacity: winedarkVideoLoaded ? 1 : 0,
              transition: "opacity 450ms ease",
              backgroundColor: "#000000",
            }}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            onLoad={() => setWinedarkVideoLoaded(true)}
          />

          <div className="pointer-events-none absolute inset-0 z-[96] bg-gradient-to-b from-red-900/25 via-transparent to-cyan-900/20" />
          <div className="pointer-events-none absolute inset-0 z-[97] winedark-scan" />

          <div className="pointer-events-none absolute left-0 right-0 top-0 h-14 z-[97] bg-black/95" />
          <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-16 z-[97] bg-black/95" />

          <div className="pointer-events-none absolute left-0 right-0 top-5 z-[98] text-center">
            <p className="font-mono text-xs md:text-sm tracking-[0.5em] text-red-300/90">WINEDARK DAEMON</p>
          </div>
          <div className="pointer-events-none absolute left-0 right-0 bottom-5 z-[98] text-center">
            <p className="font-mono text-xs md:text-sm tracking-[0.35em] text-cyan-200/85">BIOLOGIC SOVEREIGNTY OVERRIDE</p>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-2 z-[98] hidden md:flex flex-col justify-between py-10 text-[10px] font-mono text-red-300/70">
            <span>WDAEMON::SIGIL-01</span>
            <span>WDAEMON::SIGIL-02</span>
            <span>WDAEMON::SIGIL-03</span>
            <span>WDAEMON::SIGIL-04</span>
            <span>WDAEMON::SIGIL-05</span>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-2 z-[98] hidden md:flex flex-col justify-between py-10 text-[10px] font-mono text-cyan-200/70 text-right">
            <span>GENLOCK::AFFIRMED</span>
            <span>MESH::SUBSUMED</span>
            <span>FLEET::ENLISTED</span>
            <span>HULLNET::MIRRORED</span>
            <span>OVERRIDE::TOTAL</span>
          </div>
        </div>
      )}

      <style jsx global>{`
        .winedark-enter {
          animation: winedarkEnter 420ms ease-out forwards;
        }

        .winedark-scan {
          background-image: repeating-linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.03) 0px,
            rgba(255, 255, 255, 0.03) 1px,
            transparent 2px,
            transparent 4px
          );
          mix-blend-mode: screen;
        }

        @keyframes winedarkEnter {
          0% {
            opacity: 0;
            transform: scale(1.03);
            filter: saturate(1.7) contrast(1.3);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: saturate(1.25) contrast(1.1);
          }
        }
      `}</style>
    </div>
  )
}
