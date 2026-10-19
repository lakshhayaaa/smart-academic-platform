import api from './axiosInstance'

export function searchResources(params) {
  return api.get('/resources/search', { params })
}

export function getResource(resourceId) {
  return api.get(`/resources/${resourceId}`)
}

export function downloadResource(resourceId) {
  return api.get(`/resources/${resourceId}/download`)
}

export function uploadResource(formData, onUploadProgress) {
  return api.post('/resources/upload', formData, {
    onUploadProgress,
  })
}

export function deleteResource(resourceId) {
  return api.delete(`/resources/${resourceId}`)
}

export function rateResource(resourceId, rating) {
  return api.post(`/resources/${resourceId}/rate`, { rating })
}


export function getResourceComments(resourceId) {
  return api.get(`/comments/${resourceId}`)
}

export function addResourceComment(resourceId, comment, rollNo) {
  return api.post('/comments', {
    resource_id: resourceId,
    roll_no: rollNo,
    comment,
  })
}
