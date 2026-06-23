const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown
  accessToken?: string | null
  headers?: HeadersInit
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function buildUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

function getErrorMessage(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    const maybe = data as { message?: unknown; error?: unknown }
    if (typeof maybe.message === 'string') return maybe.message
    if (typeof maybe.error === 'string') return maybe.error
  }

  return typeof data === 'string' && data ? data : '?붿껌 泥섎━???ㅽ뙣?덉뒿?덈떎.'
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
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
    throw new ApiError(getErrorMessage(data), response.status, data)
  }

  return data as T
}
