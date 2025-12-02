This is a [Next.js](https://nextjs.org) project implementing OAuth2 authentication with PKCE (Proof Key for Code Exchange).

## Features

- **OAuth2 with PKCE**: Secure authentication flow using PKCE for public clients
- **Dynamic Parameter Generation**: Automatically generates `code_verifier`, `code_challenge`, `state`, and `nonce`
- **Security Validations**: State parameter validation (CSRF protection) and nonce validation (replay attack prevention)
- **Token Management**: Secure token storage in localStorage
- **User Dashboard**: Displays authenticated user information and access token

## Getting Started

1. Copy the example environment file and configure it:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` with your OAuth2 server configuration if needed.

3. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3074](http://localhost:3074) with your browser to see the result.

## OAuth2 Flow

### 1. Login Page (`/`)
- Generates PKCE parameters (`code_verifier`, `code_challenge`)
- Generates security parameters (`state`, `nonce`)
- Stores parameters in `sessionStorage`
- Redirects to OAuth2 authorization server

### 2. OAuth2 Callback (`/login/oauth2-code`)
- Validates `state` parameter against stored value (CSRF protection)
- Exchanges authorization code for access token using `code_verifier`
- Validates `nonce` in ID token
- Stores tokens in `localStorage`
- Redirects to dashboard

### 3. Dashboard (`/dashboard`)
- Displays authenticated user information from ID token
- Shows access token
- Provides logout functionality

## Configuration

Configuration is managed through environment variables in `.env.local`:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_OAUTH2_AUTHORIZATION_ENDPOINT` | OAuth2 authorization endpoint | `http://localhost:3072/oauth2/authorize` |
| `NEXT_PUBLIC_OAUTH2_TOKEN_ENDPOINT` | OAuth2 token endpoint | `http://localhost:3072/oauth2/token` |
| `NEXT_PUBLIC_OAUTH2_CLIENT_ID` | OAuth2 client ID | `nxmarket-client-web` |
| `NEXT_PUBLIC_OAUTH2_REDIRECT_URI` | OAuth2 redirect URI | `http://localhost:3074/login/oauth2-code` |
| `NEXT_PUBLIC_OAUTH2_SCOPE` | OAuth2 scopes | `openid profile api.exchange api.user` |

See `.env.example` for a complete example configuration.

## Security Features

- **PKCE (RFC 7636)**: Prevents authorization code interception attacks
- **State Parameter**: CSRF protection
- **Nonce Parameter**: Replay attack prevention
- **Secure Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)

## Project Structure

```
app/
├── page.tsx                    # Login page with OAuth2 initiation
├── dashboard/
│   └── page.tsx               # Protected dashboard page
└── login/oauth2-code/
    └── page.tsx               # OAuth2 callback handler
```
