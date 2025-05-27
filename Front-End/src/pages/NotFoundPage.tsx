import { Link } from "react-router"
import { Button } from "@/components/ui/button"

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center p-4">
      <div className="space-y-4">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">The page you are looking for doesn't exist or has been moved.</p>
        <div className="flex justify-center pt-4">
          <Button asChild>
            <Link to="/">Return Home</Link> 
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
