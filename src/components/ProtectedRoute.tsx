import { Outlet, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"

// 🔐 TEMPORARY AUTH OBJECT (replace with real auth state later)
const access_token = {
    token: "abc123",
    expires_at: Date.now() + 60 * 60 * 1000, // expires in 1 hour
    account_type: "LEAGUE_ADMIN", // valid roles: LEAGUE_ADMIN
}

export default function ProtectedRoute() {
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (!access_token?.token) {
            setError("🔒 You must be logged in.")
        } else if (Date.now() > access_token.expires_at) {
            setError("⏰ Session expired. Please login again.")
        } else if (access_token.account_type !== "LEAGUE_ADMIN") {
            setError("🚫 Access denied. League Administrator only.")
        }
    }, [])

    if (error) {
        return (
            <main className="flex items-center justify-center h-screen text-center px-4 text-red-600 text-lg font-medium">
                <section>
                    <p>{error}</p>
                    <p className="mt-2 text-sm text-gray-500">You are not allowed to access this page.</p>
                    <Button
                        onClick={() => navigate("/")}
                        className="mt-4"
                        variant="outline"
                    >
                        Go to Home
                    </Button>
                </section>
            </main>
        )
    }

    return <Outlet />
}
