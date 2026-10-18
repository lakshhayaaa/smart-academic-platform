const TOKEN_KEY = 'sars.access_token'
const UPLOAD_DRAFT_KEY = 'sars.upload_draft'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getUploadDraft() {
  const raw = sessionStorage.getItem(UPLOAD_DRAFT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setUploadDraft(draft) {
  sessionStorage.setItem(UPLOAD_DRAFT_KEY, JSON.stringify(draft))
}

export function clearUploadDraft() {
  sessionStorage.removeItem(UPLOAD_DRAFT_KEY)
}
