"use client"

import { useState } from "react"

interface RefreshTokenButtonProps {
  onTokenRefreshed?: (newAccessToken: string) => void
}

export function RefreshTokenButton({ onTokenRefreshed }: RefreshTokenButtonProps) {
  const [refreshing, setRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [refreshSuccess, setRefreshSuccess] = useState<string | null>(null)

  const handleRefreshToken = async () => {
    setRefreshing(true)
    setRefreshError(null)
    setRefreshSuccess(null)

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // Include HTTP-only cookies
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || errorData.message || `Failed to refresh token: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()

      // Update tokens in localStorage
      localStorage.setItem("access_token", data.access_token)
      if (data.id_token) {
        localStorage.setItem("id_token", data.id_token)
      }

      setRefreshSuccess("Access token refreshed successfully!")

      // Notify parent component
      if (onTokenRefreshed) {
        onTokenRefreshed(data.access_token)
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setRefreshSuccess(null)
      }, 3000)
    } catch (error) {
      console.error("Token refresh error:", error)
      setRefreshError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <>
      <button
        onClick={handleRefreshToken}
        disabled={refreshing}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {refreshing ? "Refreshing..." : "Refresh Token"}
      </button>

      {refreshSuccess && (
        <div className="absolute right-8 top-20 z-10 rounded border border-green-500 bg-green-50 p-4 text-green-700 shadow-lg dark:bg-green-950 dark:text-green-300">
          <p className="font-semibold">✓ {refreshSuccess}</p>
        </div>
      )}

      {refreshError && (
        <div className="absolute right-8 top-20 z-10 rounded border border-red-500 bg-red-50 p-4 text-red-700 shadow-lg dark:bg-red-950 dark:text-red-300">
          <p className="font-semibold">Error:</p>
          <p className="text-sm">{refreshError}</p>
        </div>
      )}
    </>
  )
}
