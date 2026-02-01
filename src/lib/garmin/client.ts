/**
 * Garmin Connect API Client
 * 
 * Uses OAuth 1.0a for authentication with Garmin Connect API.
 * Documentation: https://developer.garmin.com/gc-developer-program/
 */

import OAuth from 'oauth-1.0a'
import crypto from 'crypto'

// Garmin API endpoints
const GARMIN_REQUEST_TOKEN_URL = 'https://connectapi.garmin.com/oauth-service/oauth/request_token'
const GARMIN_AUTHORIZE_URL = 'https://connect.garmin.com/oauthConfirm'
const GARMIN_ACCESS_TOKEN_URL = 'https://connectapi.garmin.com/oauth-service/oauth/access_token'
const GARMIN_API_BASE = 'https://apis.garmin.com/wellness-api/rest'

// OAuth 1.0a configuration
const oauth = new OAuth({
  consumer: {
    key: process.env.GARMIN_CONSUMER_KEY || '',
    secret: process.env.GARMIN_CONSUMER_SECRET || '',
  },
  signature_method: 'HMAC-SHA1',
  hash_function(baseString: string, key: string) {
    return crypto.createHmac('sha1', key).update(baseString).digest('base64')
  },
})

export interface GarminTokens {
  accessToken: string
  accessTokenSecret: string
}

export interface GarminRequestToken {
  oauthToken: string
  oauthTokenSecret: string
  authorizeUrl: string
}

export interface GarminDailySummary {
  summaryId: string
  calendarDate: string
  startTimeInSeconds: number
  startTimeOffsetInSeconds: number
  activityType: string
  durationInSeconds: number
  steps: number
  distanceInMeters: number
  activeTimeInSeconds: number
  activeKilocalories: number
  bmrKilocalories: number
  consumedCalories: number
  moderateIntensityDurationInSeconds: number
  vigorousIntensityDurationInSeconds: number
  floorsClimbed: number
  minHeartRateInBeatsPerMinute: number
  maxHeartRateInBeatsPerMinute: number
  averageHeartRateInBeatsPerMinute: number
  restingHeartRateInBeatsPerMinute: number
  timeOffsetHeartRateSamples: Record<string, number>
  averageStressLevel: number
  maxStressLevel: number
  stressDurationInSeconds: number
  restStressDurationInSeconds: number
  activityStressDurationInSeconds: number
  lowStressDurationInSeconds: number
  mediumStressDurationInSeconds: number
  highStressDurationInSeconds: number
}

export interface GarminSleepData {
  summaryId: string
  calendarDate: string
  startTimeInSeconds: number
  startTimeOffsetInSeconds: number
  durationInSeconds: number
  unmeasurableSleepInSeconds: number
  deepSleepDurationInSeconds: number
  lightSleepDurationInSeconds: number
  remSleepInSeconds: number
  awakeDurationInSeconds: number
  sleepLevelsMap: Record<string, Array<{ startTimeInSeconds: number; endTimeInSeconds: number }>>
  validation: string
}

/**
 * Step 1: Get request token for OAuth flow
 */
export async function getRequestToken(callbackUrl: string): Promise<GarminRequestToken> {
  const requestData = {
    url: GARMIN_REQUEST_TOKEN_URL,
    method: 'POST',
  }

  const headers = oauth.toHeader(oauth.authorize(requestData))
  
  const response = await fetch(GARMIN_REQUEST_TOKEN_URL, {
    method: 'POST',
    headers: {
      ...headers,
      'oauth_callback': callbackUrl,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get request token: ${response.statusText}`)
  }

  const text = await response.text()
  const params = new URLSearchParams(text)
  
  const oauthToken = params.get('oauth_token')
  const oauthTokenSecret = params.get('oauth_token_secret')

  if (!oauthToken || !oauthTokenSecret) {
    throw new Error('Invalid response from Garmin')
  }

  return {
    oauthToken,
    oauthTokenSecret,
    authorizeUrl: `${GARMIN_AUTHORIZE_URL}?oauth_token=${oauthToken}`,
  }
}

/**
 * Step 2: Exchange verifier for access token
 */
export async function getAccessToken(
  requestToken: string,
  requestTokenSecret: string,
  oauthVerifier: string
): Promise<GarminTokens> {
  const requestData = {
    url: GARMIN_ACCESS_TOKEN_URL,
    method: 'POST',
  }

  const token = {
    key: requestToken,
    secret: requestTokenSecret,
  }

  const headers = oauth.toHeader(oauth.authorize(requestData, token))
  
  const response = await fetch(GARMIN_ACCESS_TOKEN_URL, {
    method: 'POST',
    headers: {
      ...headers,
      'oauth_verifier': oauthVerifier,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`)
  }

  const text = await response.text()
  const params = new URLSearchParams(text)
  
  const accessToken = params.get('oauth_token')
  const accessTokenSecret = params.get('oauth_token_secret')

  if (!accessToken || !accessTokenSecret) {
    throw new Error('Invalid response from Garmin')
  }

  return {
    accessToken,
    accessTokenSecret,
  }
}

/**
 * Make authenticated request to Garmin API
 */
async function makeGarminRequest<T>(
  url: string,
  tokens: GarminTokens
): Promise<T> {
  const requestData = {
    url,
    method: 'GET',
  }

  const token = {
    key: tokens.accessToken,
    secret: tokens.accessTokenSecret,
  }

  const headers = oauth.toHeader(oauth.authorize(requestData, token))
  
  const response = await fetch(url, {
    method: 'GET',
    headers: headers as unknown as HeadersInit,
  })

  if (!response.ok) {
    throw new Error(`Garmin API error: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get daily summaries for a date range
 */
export async function getDailySummaries(
  tokens: GarminTokens,
  startDate: Date,
  endDate: Date
): Promise<GarminDailySummary[]> {
  const startTime = Math.floor(startDate.getTime() / 1000)
  const endTime = Math.floor(endDate.getTime() / 1000)
  
  const url = `${GARMIN_API_BASE}/dailies?uploadStartTimeInSeconds=${startTime}&uploadEndTimeInSeconds=${endTime}`
  
  return makeGarminRequest<GarminDailySummary[]>(url, tokens)
}

/**
 * Get sleep data for a date range
 */
export async function getSleepData(
  tokens: GarminTokens,
  startDate: Date,
  endDate: Date
): Promise<GarminSleepData[]> {
  const startTime = Math.floor(startDate.getTime() / 1000)
  const endTime = Math.floor(endDate.getTime() / 1000)
  
  const url = `${GARMIN_API_BASE}/sleeps?uploadStartTimeInSeconds=${startTime}&uploadEndTimeInSeconds=${endTime}`
  
  return makeGarminRequest<GarminSleepData[]>(url, tokens)
}

/**
 * Deregister user (revoke access)
 */
export async function deregisterUser(tokens: GarminTokens): Promise<void> {
  const url = `${GARMIN_API_BASE}/user/registration`
  
  const requestData = {
    url,
    method: 'DELETE',
  }

  const token = {
    key: tokens.accessToken,
    secret: tokens.accessTokenSecret,
  }

  const headers = oauth.toHeader(oauth.authorize(requestData, token))
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: headers as unknown as HeadersInit,
  })

  if (!response.ok) {
    throw new Error(`Failed to deregister: ${response.statusText}`)
  }
}
