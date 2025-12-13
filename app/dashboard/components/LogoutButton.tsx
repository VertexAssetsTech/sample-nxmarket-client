"use client"

import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    // Clear client-side tokens (PKCE flow - no HTTP-only cookies)
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("id_token")
    router.push("/")
  }

  return (
    <button onClick={handleLogout} className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition">
      Locally Logout
    </button>
  )
}
