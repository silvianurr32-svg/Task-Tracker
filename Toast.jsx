import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Loader } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const handle = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blush rounded-xl2 mx-auto mb-4 flex items-center justify-center shadow-btn">
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="text-3xl text-ink">TaskProof</h1>
          <p className="text-navy/60 text-sm mt-1">Prove it. Every time.</p>
        </div>
        <div className="card p-6">
          <h2 className="text-lg mb-5 text-ink">Create account</h2>
          {err && (
            <div className="mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {err}
            </div>
          )}
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5 block">Name</label>
              <input
                type="text" required autoFocus
                className="input-field"
                placeholder="Your name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5 block">Email</label>
              <input
                type="email" required
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5 block">Password</label>
              <input
                type="password" required
                className="input-field"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading && <Loader size={14} className="animate-spin" />}
              Create account
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-navy/50 mt-4">
          Have an account?{' '}
          <Link to="/login" className="text-navy font-medium hover:text-blush transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
