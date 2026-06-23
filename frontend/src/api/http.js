const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

function buildUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

async function parseResponse(response) {
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

export async function apiRequest(path, options = {}) {
  const { body, accessToken, headers, ...fetchOptions } = options
  const requestHeaders = new Headers(headers)

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (accessToken) {
    requestHeaders.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    ...fetchOptions,
    headers: requestHeaders,
    body: body instanceof FormData || body === undefined ? body : JSON.stringify(body),
  })

  const data = await parseResponse(response)

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null
        ? data.message || data.error || '요청 처리에 실패했습니다.'
        : data || '요청 처리에 실패했습니다.'

    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}
