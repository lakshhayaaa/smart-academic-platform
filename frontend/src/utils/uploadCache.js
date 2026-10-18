let cachedFile = null

export function setCachedUploadFile(file) {
  cachedFile = file || null
}

export function getCachedUploadFile() {
  return cachedFile
}

export function clearCachedUploadFile() {
  cachedFile = null
}
