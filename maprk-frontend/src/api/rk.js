import client from './client'

// Публичные
export const getMapData = () =>
  client.get('/rk/map').then(r => Array.isArray(r.data) ? r.data : (r.data?.features || r.data?.items || []))

// Админские
export const getRKList = (params) =>
  client.get('/rk/', { params }).then(r => r.data)

export const getRKStats = () =>
  client.get('/rk/stats').then(r => r.data)

export const getRK = (rkId) =>
  client.get(`/rk/${rkId}`).then(r => r.data)

export const createRK = (data) =>
  client.post('/rk/', data).then(r => r.data)

export const updateRK = (pk, data) =>
  client.put(`/rk/${pk}`, data).then(r => r.data)

export const deleteRK = (pk) =>
  client.delete(`/rk/${pk}`)

export const uploadPhoto = (pk, file) => {
  const fd = new FormData()
  fd.append('file', file)
  return client.post(`/rk/${pk}/photo`, fd).then(r => r.data)
}

export const uploadScheme = (pk, file) => {
  const fd = new FormData()
  fd.append('file', file)
  return client.post(`/rk/${pk}/scheme`, fd).then(r => r.data)
}

export const login = (username, password) =>
  client.post('/auth/login', { username, password }).then(r => r.data)

export const exportPDF = () =>
  client.get('/rk/export/pdf', { responseType: 'blob' }).then(r => r.data)

export const exportDOCX = () =>
  client.get('/rk/export/docx', { responseType: 'blob' }).then(r => r.data)

export const downloadPassport = (pk) =>
  client.get(`/rk/${pk}/passport/pdf`, { responseType: 'blob' }).then(r => r.data)

// Утилита для скачивания blob
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
