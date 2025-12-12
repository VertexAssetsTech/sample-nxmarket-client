"use client"

import { useRouter } from "next/navigation"

export function OidcLogoutButton() {
  const router = useRouter()

  const handleOidcLogout = async () => {
    try {
      // Get the ID token for OIDC logout
      const idToken = localStorage.getItem("id_token")
      
      // Clear client-side tokens first
      localStorage.removeItem("access_token")
      localStorage.removeItem("id_token")
      
      // Clear HTTP-only refresh token cookie
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      // Build OIDC logout URL
      const authServerUrl = process.env.NEXT_PUBLIC_OAUTH2_AUTHORIZATION_URL
      if (!authServerUrl) {
        throw new Error("NEXT_PUBLIC_OAUTH2_AUTHORIZATION_URL environment variable is not set")
      }

      // Construct the RP-Initiated Logout URL
      const logoutUrl = new URL(`${authServerUrl}/connect/logout`)
      
      // Add id_token_hint if available (recommended by OIDC spec)
      if (idToken) {
        logoutUrl.searchParams.set("id_token_hint", idToken)
      }
      
      // Add post_logout_redirect_uri to redirect back to your app after logout
      const postLogoutRedirectUri = `${window.location.origin}?logged_out=true`
      logoutUrl.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri)

      // Redirect to the authorization server's logout endpoint
      window.location.href = logoutUrl.toString()
    } catch (error) {
      console.error("OIDC logout error:", error)
      // Fallback to local logout if OIDC logout fails
      router.push("/")
    }
  }

  return (
    <button
      onClick={handleOidcLogout}
      className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
    >
      Globally Logout
    </button>
  )
}
