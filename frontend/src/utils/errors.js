export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback

  const detail = error.response?.data?.detail
  if (typeof detail === 'string' && detail.trim()) return detail
  if (Array.isArray(detail) && detail.length) {
    return detail
      .map((item) => item?.msg || item?.message)
      .filter(Boolean)
      .join(' ')
  }
  if (detail && typeof detail === 'object') {
    return detail.message || detail.code || fallback
  }

  if (error.response?.data?.message) return error.response.data.message
  if (error.message === 'Network Error') return 'Network error. Check that the API is running.'
  return error.message || fallback
}

export function getErrorPayload(error) {
  const detail = error?.response?.data?.detail
  if (detail && typeof detail === 'object' && !Array.isArray(detail)) return detail
  return null
}
