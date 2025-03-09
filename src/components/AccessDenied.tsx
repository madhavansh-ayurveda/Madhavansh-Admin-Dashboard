import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { ShieldAlert, Home, ArrowLeft } from "lucide-react"

export default function AccessDenied() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="rounded-full bg-destructive/10 p-6 mb-6">
        <ShieldAlert className="h-12 w-12 text-destructive" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-2">Access Denied</h1>

      <p className="text-muted-foreground max-w-md mb-8">
        You don't have permission to access this page. Please contact your administrator if you believe this is an
        error.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>

        <Button onClick={() => navigate("/")} className="gap-2">
          <Home className="h-4 w-4" />
          Dashboard
        </Button>
      </div>
    </div>
  )
}

