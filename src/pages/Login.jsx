import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/authContext.js'
import { Canvas, useFrame } from '@react-three/fiber'
import { Icosahedron, OrbitControls } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import { usePrefersReducedMotion } from '../components/usePrefersReducedMotion.js'

function BrainMesh() {
  useFrame((state) => {
    state.scene.rotation.y += 0.0025
    state.scene.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.12
  })
  return (
    <group>
      <Icosahedron args={[1.15, 1]}>
        <meshBasicMaterial color="#7C3AED" wireframe transparent opacity={0.55} />
      </Icosahedron>
      <Icosahedron args={[0.72, 0]}>
        <meshBasicMaterial color="#06B6D4" wireframe transparent opacity={0.25} />
      </Icosahedron>
    </group>
  )
}

export function Login() {
  const { user, login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = useMemo(() => location.state?.from || '/', [location.state])
  const reduced = usePrefersReducedMotion()

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [message, setMessage] = useState('')
  const [shake, setShake] = useState(0)

  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [from, navigate, user])

  function onSubmit(e) {
    e.preventDefault()
    setMessage('')
    const res =
      mode === 'signup'
        ? signup(username, { email, password })
        : login(username, { password })
    if (!res.ok) {
      setMessage(res.message || 'Something went wrong.')
      setShake((s) => s + 1)
      return
    }
    navigate(from, { replace: true })
  }

  const strength = useMemo(() => {
    const pw = password
    if (!pw) return { label: '—', pct: 0 }
    let score = 0
    if (pw.length >= 6) score += 1
    if (pw.length >= 10) score += 1
    if (/[A-Z]/.test(pw)) score += 1
    if (/[0-9]/.test(pw)) score += 1
    if (/[^A-Za-z0-9]/.test(pw)) score += 1
    const pct = Math.min(100, Math.round((score / 5) * 100))
    const label =
      pct >= 80 ? 'Strong' : pct >= 60 ? 'Good' : pct >= 40 ? 'Fair' : 'Weak'
    return { label, pct }
  }, [password])

  return (
    <div className="mx-auto grid min-h-full w-full max-w-6xl items-center px-4 py-10">
      <div className="grid w-full gap-6 lg:grid-cols-2">
        {/* Left: 3D brain-ish wireframe */}
        <div className="relative hidden overflow-hidden rounded-2xl border border-cosmos bg-gradient-to-br from-cosmos-surface to-cosmos-surface2 lg:block">
          <div className="pointer-events-none absolute -right-32 -top-28 h-96 w-96 rounded-full bg-cosmos-accent1/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-36 -left-36 h-[520px] w-[520px] rounded-full bg-cosmos-accent2/18 blur-3xl" />
          <div className="absolute inset-0">
            <Canvas camera={{ position: [0, 0, 3.2], fov: 50 }}>
              <ambientLight intensity={1.2} />
              <BrainMesh />
              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
            </Canvas>
          </div>
          <div className="relative z-10 p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cosmos bg-black/20 px-4 py-2 text-xs text-cosmos-text2">
              <span className="h-2 w-2 rounded-full bg-cosmos-accent2 shadow-[0_0_18px_rgba(6,182,212,0.45)]" />
              Neural Cosmos — neurons firing like stars
            </div>
            <div className="mt-4 font-heading text-3xl font-semibold text-cosmos-text">
              Learn AIML by playing
            </div>
            <div className="mt-2 max-w-md text-sm text-cosmos-text2">
              Make decisions, tune hyperparameters, take quizzes — everything saved locally for hackathon speed.
            </div>
          </div>
        </div>

        {/* Right: form */}
        <motion.div
          key={shake}
          className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-cosmos bg-white/5 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
          animate={message && !reduced ? { x: [0, -10, 10, -6, 6, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cosmos-accent1/22 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-cosmos-accent2/16 blur-3xl" />

          <div className="absolute right-4 top-4 rounded-full border border-cosmos bg-black/20 px-3 py-1 text-xs font-semibold text-cosmos-accent3">
            VIBETHON Edition
          </div>

          <div className="mb-6">
            <div className="text-sm font-semibold text-cosmos-accent1">NeuralPlayground</div>
            <h1 className="mt-1 font-heading text-2xl font-semibold text-cosmos-text">
              Pro — Hackathon Build
            </h1>
            <p className="mt-2 text-sm text-cosmos-text2">
              Register/login is local-only (no backend).
            </p>
          </div>

          <div className="relative mb-6 rounded-full border border-cosmos bg-black/20 p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={[
                'relative z-10 w-1/2 rounded-full px-3 py-2 text-sm font-semibold transition',
                mode === 'login' ? 'text-cosmos-text' : 'text-cosmos-text2 hover:text-cosmos-text',
              ].join(' ')}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={[
                'relative z-10 w-1/2 rounded-full px-3 py-2 text-sm font-semibold transition',
                mode === 'signup' ? 'text-cosmos-text' : 'text-cosmos-text2 hover:text-cosmos-text',
              ].join(' ')}
            >
              Signup
            </button>
            <motion.div
              layout
              className="absolute inset-y-1 w-1/2 rounded-full bg-white/5 ring-1 ring-cosmos-accent1/25"
              style={{ left: mode === 'login' ? '4px' : 'calc(50% + 0px)', right: 'auto' }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-cosmos-text2">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={mode === 'login' ? 'username or email' : 'e.g. vibecoder'}
                className="w-full rounded-2xl border border-cosmos bg-black/30 px-4 py-3 text-cosmos-text placeholder:text-cosmos-text2/60 outline-none ring-cosmos-accent1/40 focus:ring-2"
              />
            </div>

            {mode === 'signup' ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-cosmos-text2">Email (optional)</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-cosmos bg-black/30 px-4 py-3 text-cosmos-text placeholder:text-cosmos-text2/60 outline-none ring-cosmos-accent2/30 focus:ring-2"
                />
              </div>
            ) : null}

            <div>
              <div className="flex items-center justify-between">
                <label className="mb-2 block text-sm font-medium text-cosmos-text2">Password</label>
                <button
                  type="button"
                  className="text-xs text-cosmos-text2 hover:text-cosmos-text"
                  onClick={() => setShowPw((s) => !s)}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPw ? 'text' : 'password'}
                placeholder="6+ characters"
                className="w-full rounded-2xl border border-cosmos bg-black/30 px-4 py-3 text-cosmos-text placeholder:text-cosmos-text2/60 outline-none ring-cosmos-accent3/30 focus:ring-2"
              />
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-cosmos-text2">
                  <span>Strength: <span className="font-semibold text-cosmos-text">{strength.label}</span></span>
                  <span>{strength.pct}%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cosmos-accent1 to-cosmos-accent2"
                    style={{ width: `${strength.pct}%` }}
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {message ? (
                <motion.div
                  className="rounded-2xl border border-cosmos-danger/30 bg-cosmos-danger/10 px-4 py-3 text-sm text-rose-100"
                  initial={reduced ? false : { opacity: 0, y: -6 }}
                  animate={reduced ? {} : { opacity: 1, y: 0 }}
                  exit={reduced ? {} : { opacity: 0, y: -6 }}
                >
                  {message}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <button type="submit" className="w-full cosmos-button cosmos-button-primary">
              {mode === 'signup' ? 'Create account' : 'Enter playground'}
            </button>
          </form>

          <div className="mt-6 text-xs text-cosmos-text2">
            Progress is stored locally on this device.
          </div>
        </motion.div>
      </div>
    </div>
  )
}

