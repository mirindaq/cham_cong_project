import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">AttendanceTracker</h1>
            <div className="space-x-4">
              <Link to="/login">
                <Button variant="secondary">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold tracking-tight">Manage attendance with ease</h2>
            <p className="text-xl text-muted-foreground">
              A comprehensive solution for tracking employee attendance, managing leave requests, and generating
              reports.
            </p>
            <div className="flex gap-4">
              <Link to="/login">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Check-in/out</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Track your work hours with easy check-in and check-out functionality.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Leave Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Request and manage leave days with an intuitive interface.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Generate comprehensive reports for attendance and leave data.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Multi-location</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Support for multiple work locations and branches.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 AttendanceTracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
