import { NextRequest, NextResponse } from 'next/server'
import { completeGarminConnect } from '@/app/(dashboard)/fitness/actions'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  const oauthToken = searchParams.get('oauth_token')
  const oauthVerifier = searchParams.get('oauth_verifier')
  const state = searchParams.get('state')

  if (!oauthToken || !oauthVerifier || !state) {
    return NextResponse.redirect(
      new URL('/fitness?error=missing_params', request.url)
    )
  }

  try {
    // Parse state to get request token secret
    const stateData = JSON.parse(decodeURIComponent(state))
    const requestTokenSecret = stateData.secret

    if (!requestTokenSecret) {
      return NextResponse.redirect(
        new URL('/fitness?error=invalid_state', request.url)
      )
    }

    // Complete OAuth flow
    const result = await completeGarminConnect(
      oauthToken,
      requestTokenSecret,
      oauthVerifier
    )

    if (result.error) {
      return NextResponse.redirect(
        new URL(`/fitness?error=${encodeURIComponent(result.error)}`, request.url)
      )
    }

    // Success - redirect to fitness page
    return NextResponse.redirect(
      new URL('/fitness?connected=garmin', request.url)
    )
  } catch (error) {
    console.error('Garmin callback error:', error)
    return NextResponse.redirect(
      new URL('/fitness?error=callback_failed', request.url)
    )
  }
}
