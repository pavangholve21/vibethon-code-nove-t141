const ACHIEVEMENTS = [
  {
    id: 'first-blood',
    name: 'First Blood',
    desc: 'Complete your first module.',
    icon: '🩸',
    when: (u) => (u?.progress?.modulesCompleted?.length ?? 0) >= 1,
  },
  {
    id: 'sharp-shooter',
    name: 'Sharp Shooter',
    desc: 'Simulator accuracy above 80%.',
    icon: '🎯',
    when: (u) => Number(u?.progress?.simulator?.accuracy ?? 0) > 80,
  },
  {
    id: 'quiz-master',
    name: 'Quiz Master',
    desc: 'Score 5/5 on the quiz.',
    icon: '👑',
    when: (u) => Number(u?.progress?.quizScore ?? 0) === 5,
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    desc: 'Complete any module in one session.',
    // Heuristic: any module completion + any other progress change while app is open.
    // We mark it when streak gets incremented at least once.
    icon: '⚡',
    when: (u) => Number(u?.progress?.streak ?? 0) >= 1,
  },
  {
    id: 'neural-nerd',
    name: 'Neural Nerd',
    desc: 'Complete all 7 modules.',
    icon: '🧠',
    when: (u) => (u?.progress?.modulesCompleted?.length ?? 0) >= 7,
  },
]

export function getAllAchievements() {
  return ACHIEVEMENTS
}

export function computeNewBadges(user) {
  const earned = new Set(user?.progress?.badges ?? [])
  const unlockedNow = []
  for (const a of ACHIEVEMENTS) {
    if (!earned.has(a.id) && a.when(user)) unlockedNow.push(a.id)
  }
  return unlockedNow
}

export function mergeBadges(existing, add) {
  const set = new Set([...(existing ?? []), ...(add ?? [])])
  return Array.from(set)
}

export function achievementById(id) {
  return ACHIEVEMENTS.find((a) => a.id === id) || null
}

