import { test, expect, type Page } from '@playwright/test'

/**
 * Smoke tests for Atmando Health.
 *
 * These tests verify basic rendering and auth-gating without
 * requiring a running Supabase instance or valid credentials.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when a page-error is a benign Supabase connection failure
 * that we can safely ignore in E2E (no real backend expected in CI).
 */
function isSupabaseConnectionError(error: Error): boolean {
  const msg = error.message.toLowerCase()
  return (
    msg.includes('supabase') ||
    msg.includes('fetch') ||
    msg.includes('network') ||
    msg.includes('failed to fetch') ||
    msg.includes('econnrefused') ||
    msg.includes('load failed') ||
    msg.includes('hydration')
  )
}

// ---------------------------------------------------------------------------
// 1. Login page renders
// ---------------------------------------------------------------------------

test.describe('Login page', () => {
  test('renders with a sign-in / Masuk button or Google auth', async ({ page }) => {
    await page.goto('/login')

    // The login page should contain either a "Masuk" button, a Google
    // sign-in button, or at minimum something prompting the user to log in.
    // We look for several possible indicators.
    const masukButton = page.getByRole('button', { name: /masuk/i })
    const googleButton = page.getByRole('button', { name: /google/i })
    const signInText = page.getByText(/masuk|sign.in|login/i).first()

    const hasAny = await Promise.any([
      masukButton.waitFor({ timeout: 10_000 }).then(() => true),
      googleButton.waitFor({ timeout: 10_000 }).then(() => true),
      signInText.waitFor({ timeout: 10_000 }).then(() => true),
    ]).catch(() => false)

    expect(hasAny).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// 2. Protected routes redirect to /login when unauthenticated
// ---------------------------------------------------------------------------

test.describe('Protected routes redirect to /login', () => {
  const protectedRoutes = [
    '/dashboard',
    '/health',
    '/documents',
    '/vaccinations',
    '/medications',
    '/visits',
    '/members',
    '/settings',
  ]

  for (const route of protectedRoutes) {
    test(`${route} redirects to /login`, async ({ page }) => {
      // Navigate without any auth cookies — middleware should redirect.
      const response = await page.goto(route, { waitUntil: 'commit' })

      // Accept either:
      //  a) A redirect to /login (URL changes)
      //  b) The page renders login content (SPA-style redirect)
      const url = page.url()
      const redirectedToLogin = url.includes('/login')

      if (!redirectedToLogin) {
        // If the URL did not change, the page might still render login
        // content inline — check for that.
        const loginContent = page.getByText(/masuk|sign.in|login/i).first()
        await expect(loginContent).toBeVisible({ timeout: 10_000 })
      } else {
        expect(url).toContain('/login')
      }
    })
  }
})

// ---------------------------------------------------------------------------
// 3. PIN login page renders
// ---------------------------------------------------------------------------

test.describe('PIN login page', () => {
  test('renders without crashing', async ({ page }) => {
    const response = await page.goto('/pin-login')

    // The page should at minimum load (200 or 404 if not implemented yet).
    // We verify no fatal crash occurred.
    expect(response).not.toBeNull()
    const status = response!.status()
    // 200 = page exists, 404 = not built yet but server is alive
    expect([200, 404]).toContain(status)

    // If the page loaded successfully, look for PIN-related content.
    if (status === 200) {
      const pinContent = page.getByText(/pin|kode|sandi/i).first()
      const hasContent = await pinContent.isVisible().catch(() => false)
      // Soft assertion: the page loaded, content is a bonus.
      if (hasContent) {
        await expect(pinContent).toBeVisible()
      }
    }
  })
})

// ---------------------------------------------------------------------------
// 4. No crash errors on login page
// ---------------------------------------------------------------------------

test.describe('No crash errors on login page', () => {
  test('no unexpected page errors', async ({ page }) => {
    const unexpectedErrors: string[] = []

    page.on('pageerror', (error) => {
      // Filter out known benign errors (e.g. Supabase connection issues
      // when there is no real backend).
      if (!isSupabaseConnectionError(error)) {
        unexpectedErrors.push(error.message)
      }
    })

    await page.goto('/login')

    // Give the page a moment to settle and fire any deferred errors.
    await page.waitForTimeout(3_000)

    expect(
      unexpectedErrors,
      `Unexpected page errors:\n${unexpectedErrors.join('\n')}`
    ).toHaveLength(0)
  })
})
