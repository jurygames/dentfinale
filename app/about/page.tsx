import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-6">About Us</h1>

        <div className="space-y-6">
          <p className="text-lg">
            Welcome to our About page. We are a dedicated team passionate about creating amazing web experiences.
          </p>

          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
            <p>
              Our mission is to provide high-quality web solutions that help businesses and individuals achieve their
              goals online. We believe in creating intuitive, accessible, and performant web applications.
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Our Team</h2>
            <p>
              Our team consists of experienced developers, designers, and product managers who work together to deliver
              exceptional results. We value collaboration, innovation, and continuous learning.
            </p>
          </div>

          <div className="mt-8">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
