import { useMemo, useState } from 'react'
import {
  getUserByUsername,
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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const username = loadCurrentUsername()
    if (!username) return null
    return getUserByUsername(username)
  })

  const value = useMemo(() => {
    function signup(username) {
      const clean = normalizeUsername(username)
      if (!clean) return { ok: false, message: 'Please enter a username.' }

      const existing = getUserByUsername(clean)
      if (existing) return { ok: false, message: 'Username already exists. Try login.' }

      const created = upsertUser({ username: clean })
      saveCurrentUsername(clean)
      setUser(created)
      return { ok: true }
    }

    function login(username) {
      const clean = normalizeUsername(username)
      if (!clean) return { ok: false, message: 'Please enter a username.' }

      const existing = getUserByUsername(clean)
      if (!existing) return { ok: false, message: 'User not found. Try signup.' }

      saveCurrentUsername(clean)
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

