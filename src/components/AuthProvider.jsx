import { useMemo, useState } from 'react'
import {
  getUserByUsername,
  loadUsers,
  loadCurrentUsername,
  clearCurrentUsername,
  saveCurrentUsername,
  upsertUser,
} from '../utils/storage.js'
import { AuthContext } from './authContext.js'
import { computeNewBadges, mergeBadges } from '../utils/achievements.js'

function normalizeUsername(name) {
  return name.trim().replace(/\s+/g, ' ')
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function hashPassword(pw) {
  // hackathon-grade "hash": reversible base64 to avoid heavy crypto libs
  return btoa(unescape(encodeURIComponent(String(pw || ''))))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const username = loadCurrentUsername()
    if (!username) return null
    return getUserByUsername(username)
  })

  const value = useMemo(() => {
    function signup(username, { email = '', password = '' } = {}) {
      const clean = normalizeUsername(username)
      if (!clean) return { ok: false, message: 'Please enter a username.' }

      const existing = getUserByUsername(clean)
      if (existing) return { ok: false, message: 'Username already exists. Try login.' }

      const mail = normalizeEmail(email)
      if (mail && loadUsers().some((u) => (u.email || '').toLowerCase() === mail)) {
        return { ok: false, message: 'Email already exists. Try login.' }
      }

      if (password && password.length < 6) {
        return { ok: false, message: 'Password must be at least 6 characters.' }
      }

      const created = upsertUser({
        username: clean,
        email: mail,
        passwordHash: password ? hashPassword(password) : '',
      })
      saveCurrentUsername(clean)
      setUser(created)
      return { ok: true }
    }

    function login(identifier, { password = '' } = {}) {
      const id = String(identifier || '').trim()
      if (!id) return { ok: false, message: 'Please enter username or email.' }

      const users = loadUsers()
      const existing =
        users.find((u) => u.username === id) ||
        users.find((u) => (u.email || '').toLowerCase() === id.toLowerCase()) ||
        null
      if (!existing) return { ok: false, message: 'User not found. Try signup.' }

      // If a password is set for the user, require it.
      if (existing.passwordHash) {
        if (!password) return { ok: false, message: 'Password required for this account.' }
        if (hashPassword(password) !== existing.passwordHash) {
          return { ok: false, message: 'Incorrect password.' }
        }
      }

      saveCurrentUsername(existing.username)
      setUser(existing)
      return { ok: true }
    }

    function logout() {
      clearCurrentUsername()
      setUser(null)
    }

    function updateProgress(progressPatch) {
      if (!user) return null
      // Increment streak for meaningful activity (any progress write).
      const prevStreak = Number(user?.progress?.streak ?? 0)
      const nextStreak = prevStreak + 1
      const combined = { ...progressPatch, streak: progressPatch.streak ?? nextStreak }

      let next = upsertUser({ username: user.username, progress: combined })

      // Achievements are derived; merge + persist without changing existing key names.
      const unlockedNow = computeNewBadges(next)
      if (unlockedNow.length) {
        next = upsertUser({
          username: user.username,
          progress: { badges: mergeBadges(next.progress?.badges, unlockedNow) },
        })
      }
      setUser(next)
      return next
    }

    return { user, login, signup, logout, updateProgress }
  }, [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

