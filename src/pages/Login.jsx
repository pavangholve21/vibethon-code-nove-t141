import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/authContext.js'

export function Login() {
  const { user, login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = useMemo(() => location.state?.from || '/', [location.state])

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [from, navigate, user])

  function onSubmit(e) {
    e.preventDefault()
    setMessage('')
    const res = mode === 'signup' ? signup(username) : login(username)
    if (!res.ok) {
      setMessage(res.message || 'Something went wrong.')
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="mx-auto grid min-h-full w-full max-w-6xl items-center px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20">
        <div className="mb-6">
          <div className="text-sm font-semibold text-violet-200">VIBETHON</div>
          <h1 className="mt-1 text-2xl font-bold text-white">
            NeuralPlayground Pro
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Learn classification basics through mini-games and simulations.
          </p>
        </div>

        <div className="mb-6 flex rounded-xl bg-black/20 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={[
              'flex-1 rounded-lg px-3 py-2 text-sm font-semibold',
              mode === 'login' ? 'bg-white/10 text-white' : 'text-slate-300',
            ].join(' ')}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={[
              'flex-1 rounded-lg px-3 py-2 text-sm font-semibold',
              mode === 'signup' ? 'bg-white/10 text-white' : 'text-slate-300',
            ].join(' ')}
          >
            Signup
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. vibecoder"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 outline-none ring-violet-400 focus:ring-2"
            />
          </div>

          {message ? (
            <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-400"
          >
            {mode === 'signup' ? 'Create account' : 'Enter playground'}
          </button>
        </form>

        <div className="mt-6 text-xs text-slate-400">
          Progress is stored locally on this device (no backend).
        </div>
      </div>
    </div>
  )
}

