"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

// Generate a random string for code_verifier
function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return base64UrlEncode(array)
}

// Base64-URL encode
function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer))
  return base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

// Generate code_challenge from code_verifier using SHA-256
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return base64UrlEncode(new Uint8Array(hash))
}

function HomeContent() {
  const [authUrl, setAuthUrl] = useState<string>("#")
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  useEffect(() => {
    async function setupPKCE() {
      const clientId = process.env.NEXT_PUBLIC_OAUTH2_CLIENT_ID!
      const scope = process.env.NEXT_PUBLIC_OAUTH2_SCOPE!
      const redirectUri = process.env.NEXT_PUBLIC_OAUTH2_REDIRECT_URI!

      // Generate PKCE parameters
      const codeVerifier = generateCodeVerifier()
      const codeChallenge = await generateCodeChallenge(codeVerifier)

      // Generate state and nonce
      const state = generateCodeVerifier()
      const nonce = generateCodeVerifier()

      // Store code_verifier and state for later use during token exchange
      sessionStorage.setItem("pkce_code_verifier", codeVerifier)
      sessionStorage.setItem("oauth_state", state)
      sessionStorage.setItem("oauth_nonce", nonce)

      const usp = new URLSearchParams()
      usp.set("response_type", "code")
      usp.set("client_id", clientId)
      usp.set("scope", scope)
      usp.set("state", state)
      usp.set("redirect_uri", redirectUri)
      usp.set("nonce", nonce)
      usp.set("code_challenge", codeChallenge)
      usp.set("code_challenge_method", "S256")

      const authorizationEndpoint = process.env.NEXT_PUBLIC_OAUTH2_AUTHORIZATION_URL!
      setAuthUrl(`${authorizationEndpoint}/oauth2/authorize?${usp.toString()}`)
    }

    setupPKCE()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center gap-6 rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-900">
        <h1 className="text-3xl font-bold">Welcome</h1>
        
        {error && (
          <div className="w-full rounded border border-red-500 bg-red-50 p-4 text-red-700 dark:bg-red-950 dark:text-red-300">
            <p className="font-semibold">Authentication Error:</p>
            <p className="text-sm">{error}</p>
            {errorDescription && <p className="text-sm mt-1">{errorDescription}</p>}
          </div>
        )}

        <Link
          href={authUrl}
          className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition font-medium"
        >
          Login with OAuth2
        </Link>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
          Using OAuth2 with PKCE for secure authentication
        </p>
      </main>
    </div>
  )
}

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center gap-6 rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-900">
        <h1 className="text-3xl font-bold">Welcome</h1>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600"></div>
      </main>
    </div>
  )
}

// Wrap the component that uses useSearchParams in Suspense
export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomeContent />
    </Suspense>
  )
}
