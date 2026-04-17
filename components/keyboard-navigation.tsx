"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function KeyboardNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Home page has its own scripted keyboard flow; don't override it globally.
    if (pathname === "/") return

    // This function will handle the keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      // Log the key press for debugging
      console.log("Key pressed:", event.key)
      
      // Handle navigation based on key press
      switch (event.key) {
        case "1":
          console.log("Navigating to home")
          router.push("/")
          event.preventDefault() // Prevent default behavior
          break
        case "2":
          console.log("Navigating to video")
          router.push("/video")
          event.preventDefault() // Prevent default behavior
          break
        case "3":
          console.log("Navigating to image")
          router.push("/image")
          event.preventDefault() // Prevent default behavior
          break
        case "Escape":
          console.log("Escape pressed, navigating to home")
          router.push("/")
          event.preventDefault() // Prevent default behavior
          break
        default:
          break
      }
    }

    // Add the event listener to the document.
    document.addEventListener("keydown", handleKeyDown)
    
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [router, pathname])

  // Return null as this component doesn't render anything
  return null
}
