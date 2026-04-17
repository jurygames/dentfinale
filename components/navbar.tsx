"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export default function Navbar() {
  const pathname = usePathname()

  // Hide navbar on the homepage, video page, and image page
  if (pathname === "/" || pathname === "/video" || pathname === "/image") {
    return null
  }

  const navItems = [
    { name: "Home (1)", href: "/" },
    { name: "Video (2)", href: "/video" },
    { name: "Image (3)", href: "/image" },
  ]

  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="font-bold text-xl">
              Interactive App
            </Link>

            <nav className="hidden md:flex gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <div className="md:hidden">
              <MobileNav navItems={navItems} pathname={pathname} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function MobileNav({
  navItems,
  pathname,
}: {
  navItems: { name: string; href: string }[]
  pathname: string
}) {
  return (
    <div className="relative">
      <details className="group [&[open]>summary::after]:rotate-180">
        <summary className="list-none cursor-pointer">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </summary>
        <div className="absolute right-0 mt-2 w-40 rounded-md border bg-popover shadow-md z-10">
          <div className="p-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block w-full rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </details>
    </div>
  )
}
