const KEYS = {
  users: 'np_users',
  currentUser: 'np_currentUser',
  theme: 'np_theme',
}

function safeParse(json, fallback) {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

export function loadUsers() {
  const raw = localStorage.getItem(KEYS.users)
  const users = safeParse(raw ?? '[]', [])
  return Array.isArray(users) ? users : []
}

export function saveUsers(users) {
  localStorage.setItem(KEYS.users, JSON.stringify(users))
}

export function loadCurrentUsername() {
  return localStorage.getItem(KEYS.currentUser) || ''
}

export function saveCurrentUsername(username) {
  localStorage.setItem(KEYS.currentUser, username)
}

export function clearCurrentUsername() {
  localStorage.removeItem(KEYS.currentUser)
}

export function loadTheme() {
  const t = localStorage.getItem(KEYS.theme)
  return t === 'light' ? 'light' : 'dark'
}

export function saveTheme(theme) {
  localStorage.setItem(KEYS.theme, theme === 'light' ? 'light' : 'dark')
}

export function upsertUser(userPatch) {
  const users = loadUsers()
  const idx = users.findIndex((u) => u.username === userPatch.username)
  const now = new Date().toISOString()

  const prev = idx === -1 ? null : users[idx]
  const prevProgress = prev?.progress ?? {}
  const prevSim = prevProgress?.simulator ?? {}

  const nextSimulator = {
    correct: prevSim.correct ?? 0,
    total: prevSim.total ?? 0,
    accuracy: prevSim.accuracy ?? 0,
    ...(userPatch.progress?.simulator ?? {}),
  }

  const next = {
    username: userPatch.username,
    email: userPatch.email ?? prev?.email ?? '',
    passwordHash: userPatch.passwordHash ?? prev?.passwordHash ?? '',
    createdAt: prev?.createdAt ?? now,
    lastUpdated: now,
    progress: {
      modulesCompleted: [],
      quizScore: 0,
      badges: [],
      streak: 0,
      gameBestAccuracy: 0,
      ...prevProgress,
      ...userPatch.progress,
      simulator: nextSimulator,
    },
  }

  if (idx === -1) users.unshift(next)
  else users[idx] = next

  saveUsers(users)
  return next
}

export function getUserByUsername(username) {
  return loadUsers().find((u) => u.username === username) || null
}

