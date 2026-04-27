const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    ...options,
    body: options.body instanceof FormData ? options.body
          : options.body ? JSON.stringify(options.body) : undefined
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  me:           ()         => request('/auth/me'),
  login:        (b)        => request('/auth/login',    { method: 'POST', body: b }),
  register:     (b)        => request('/auth/register', { method: 'POST', body: b }),
  logout:       ()         => request('/auth/logout',   { method: 'POST' }),
  getTasks:     ()         => request('/tasks'),
  createTask:   (b)        => request('/tasks',         { method: 'POST', body: b }),
  updateTask:   (id, b)    => request(`/tasks/${id}`,   { method: 'PUT',  body: b }),
  deleteTask:   (id)       => request(`/tasks/${id}`,   { method: 'DELETE' }),
  uploadProof:  (id, form) => request(`/tasks/${id}/proof`, { method: 'POST', body: form }),
}
