import { cookies } from "next/headers"
import { NextResponse } from "next/server"

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
  refresh_token?: string
  id_token?: string
}

interface TokenErrorResponse {
  error: string
  error_description?: string
}

export async function POST() {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("refresh_token")?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token available" },
        { status: 401 }
      )
    }

    // Server-side OAuth credentials
    const tokenEndpoint = process.env.OAUTH2_TOKEN_ENDPOINT
    const clientId = process.env.NEXT_PUBLIC_OAUTH2_CLIENT_ID
    const clientSecret = process.env.OAUTH2_CLIENT_SECRET

    if (!tokenEndpoint || !clientId || !clientSecret) {
      console.error("Missing OAuth2 configuration")
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    // Refresh the access token
    const tokenParams = new URLSearchParams()
    tokenParams.set("grant_type", "refresh_token")
    tokenParams.set("refresh_token", refreshToken)

    const tokenResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        
        // Basic Authentication type for this client
        "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: tokenParams.toString(),
    })

    if (!tokenResponse.ok) {
      const errorData: TokenErrorResponse = await tokenResponse.json().catch(() => ({
        error: `HTTP ${tokenResponse.status}`,
      }))
      console.error("Token refresh failed:", errorData)
      
      // If refresh fails, clear the invalid refresh token cookie
      if (tokenResponse.status === 400 || tokenResponse.status === 401) {
        cookieStore.delete("refresh_token")
      }
      
      return NextResponse.json(
        { error: errorData.error, error_description: errorData.error_description },
        { status: tokenResponse.status }
      )
    }

    const tokenData: TokenResponse = await tokenResponse.json()

    // Update refresh token cookie if a new one is provided (token rotation)
    if (tokenData.refresh_token) {
      cookieStore.set("refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      })
    }

    // Return new access token to client
    return NextResponse.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      id_token: tokenData.id_token,
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
