import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Loader2, MailCheck } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { authErrorMessage, useAuth } from '../context/AuthContext'

export default function SignUpPage() {
  const { user, signUp } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  if (user) return <Navigate to="/" replace />

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email'))
    const password = String(form.get('password'))
    if (password !== form.get('confirm')) return setError('Passwords do not match.')

    setSubmitting(true)
    setError(null)
    try {
      const { needsConfirmation } = await signUp(email, password, String(form.get('fullName')).trim())
      if (needsConfirmation) setSentTo(email)
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (sentTo) {
    return (
      <AuthLayout title="Check your inbox" subtitle="One more step to join the bazaar.">
        <div className="rounded-xl bg-primary-50 p-5 text-center">
          <MailCheck className="mx-auto h-10 w-10 text-primary-700" />
          <p className="mt-3 text-sm text-primary-900">
            We sent a confirmation link to <b>{sentTo}</b>. Open it to activate your account — you'll be signed in automatically.
          </p>
        </div>
        <p className="mt-6 text-center text-sm text-neutral-600">
          Already confirmed? <Link to="/signin" className="font-semibold text-primary-700 hover:underline">Sign in</Link>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Join Campus Bazaar" subtitle="Free for every NIT Srinagar student.">
      <form onSubmit={submit} className="grid gap-4">
        <div>
          <label htmlFor="fullName" className="label">Full name</label>
          <input id="fullName" name="fullName" required minLength={2} maxLength={80} autoComplete="name" placeholder="Ishaan Wani" className="field" />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@nitsri.ac.in" className="field" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="field" />
          </div>
          <div>
            <label htmlFor="confirm" className="label">Confirm</label>
            <input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className="field" />
          </div>
        </div>
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
        <button disabled={submitting} className="btn-primary w-full">
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-neutral-600">
        Already have an account? <Link to="/signin" className="font-semibold text-primary-700 hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
