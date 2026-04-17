import type { Metadata } from "next"
import { Inter, Exo_2 } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import KeyboardNavigation from "@/components/keyboard-navigation"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const exo2 = Exo_2({ subsets: ["latin"], variable: "--font-exo2" })

export const metadata: Metadata = {
  title: "Interactive App",
  description: "An interactive web application",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${exo2.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <KeyboardNavigation />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
