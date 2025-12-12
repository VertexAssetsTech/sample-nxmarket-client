"use client"

import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    // Call server to clear HTTP-only refresh token cookie
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
    
    // Clear client-side tokens
    localStorage.removeItem("access_token")
    localStorage.removeItem("id_token")
    router.push("/")
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition"
    >
      Logout
    </button>
  )
}
