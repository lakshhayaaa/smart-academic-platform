import { Eye, EyeOff, GraduationCap } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/errors'

export default function RegisterPage() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    roll_no: '',
    email: '',
    password: '',
    regulation_year: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required.'
    if (!form.roll_no.trim()) next.roll_no = 'Roll number is required.'
    if (!form.email.trim()) next.email = 'College email is required.'
    if (!form.password || form.password.length < 6) next.password = 'Use a password with at least 6 characters.'
    if (!form.regulation_year) next.regulation_year = 'Regulation year is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await register({
        name: form.name.trim(),
        roll_no: form.roll_no.trim(),
        email: form.email.trim(),
        password: form.password,
        regulation_year: Number(form.regulation_year),
      })
      toast.success('Account created. Sign in to continue.')
      navigate('/login')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Registration failed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-600 p-2 text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Create your account</h1>
            <p className="text-sm text-slate-500">Department is inferred from your roll number.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
            <input id="name" value={form.name} onChange={(event) => update('name', event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            {errors.name ? <p className="mt-1 text-sm text-rose-600">{errors.name}</p> : null}
          </div>
          <div>
            <label htmlFor="roll_no" className="mb-1 block text-sm font-medium text-slate-700">Roll number</label>
            <input id="roll_no" value={form.roll_no} onChange={(event) => update('roll_no', event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            {errors.roll_no ? <p className="mt-1 text-sm text-rose-600">{errors.roll_no}</p> : null}
          </div>
          <div>
            <label htmlFor="regulation_year" className="mb-1 block text-sm font-medium text-slate-700">Regulation year</label>
            <input id="regulation_year" type="number" min="1" value={form.regulation_year} onChange={(event) => update('regulation_year', event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            {errors.regulation_year ? <p className="mt-1 text-sm text-rose-600">{errors.regulation_year}</p> : null}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">College email</label>
            <input id="email" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            {errors.email ? <p className="mt-1 text-sm text-rose-600">{errors.email}</p> : null}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(event) => update('password', event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm"
              />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password ? <p className="mt-1 text-sm text-rose-600">{errors.password}</p> : null}
          </div>
          <button type="submit" disabled={submitting} className="sm:col-span-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
            {submitting ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-indigo-600">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
