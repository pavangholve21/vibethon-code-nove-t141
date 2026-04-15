export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

export function round1(n) {
  return Math.round(n * 10) / 10
}

export function calcAccuracy(correct, total) {
  if (!total) return 0
  return (correct / total) * 100
}

export function leaderboardScore(user) {
  const quiz = Number(user?.progress?.quizScore ?? 0)
  const simAcc = Number(user?.progress?.simulator?.accuracy ?? 0)
  return Math.round(quiz + simAcc)
}

