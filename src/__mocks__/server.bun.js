// MSW config for bun test - intercepts all network calls and throws errors
// This helps identify which network calls need explicit mocking in unit tests
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Catch-all handler that errors on any unhandled network request
const catchAllHandler = http.all('*', ({ request }) => {
  const url = new URL(request.url)
  console.error(`🚨 Unhandled network request in bun test: ${request.method} ${url.href}`)
  console.error('This network call should be explicitly mocked in your test file.')

  // Return error response instead of throwing to avoid breaking tests
  return HttpResponse.json(
    {
      error: 'Unhandled network request in test',
      method: request.method,
      url: url.href,
      message: 'Add local mocking for this API call to ensure test isolation.',
    },
    { status: 500 },
  )
})

export const server = setupServer(catchAllHandler)

/**
 * Initialize the MSW server for testing
 *
 * @return {object} The configured MSW server
 */
export function initServer() {
  return server
}
