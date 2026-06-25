const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

// auth store가 주입하는 콜백 — http.js와 store 간 순환 의존성 방지
let _refreshCallback = null
let _onUnauthorized = null

export function registerRefreshCallback(fn) {
  _refreshCallback = fn
}

export function registerUnauthorizedCallback(fn) {
  _onUnauthorized = fn
}

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
  const { body, accessToken, headers, _isRetry, ...fetchOptions } = options
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

  // 인증이 필요한 요청의 401만 토큰 갱신 후 재시도한다.
  // 로그인/회원가입의 401은 잘못된 입력에 대한 응답이므로 원래 오류를 그대로 전달한다.
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const isPublicAuthRequest = ['/auth/login', '/auth/signup', '/auth/refresh'].includes(normalizedPath)
  if (response.status === 401 && !_isRetry && !isPublicAuthRequest && _refreshCallback) {
    try {
      const newAccessToken = await _refreshCallback()
      return apiRequest(path, { ...options, accessToken: newAccessToken, _isRetry: true })
    } catch {
      _onUnauthorized?.()
      const error = new Error('인증이 만료되었습니다. 다시 로그인해 주세요.')
      error.status = 401
      throw error
    }
  }

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
