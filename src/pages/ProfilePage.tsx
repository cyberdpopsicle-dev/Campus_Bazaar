import { useEffect, useState, type FormEvent } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { api, type Profile } from '../lib/api'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.profile().then(setProfile).catch((e: Error) => setError(e.message))
  }, [])

  const set = (key: keyof Profile) => (e: { target: { value: string } }) => {
    setSaved(false)
    setProfile((p) => (p ? { ...p, [key]: e.target.value } : p))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setError(null)
    try {
      const { email: _email, ...rest } = profile
      setProfile(await api.saveProfile(rest))
      setSaved(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Your profile</h1>
      <p className="mt-1 text-neutral-600">Signed-in buyers see your phone and hostel so they can reach you.</p>

      {!profile ? (
        error ? (
          <p className="card mt-8 p-6 text-center font-semibold text-red-600">{error}</p>
        ) : (
          <div className="card mt-8 space-y-4 p-8">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-11 w-full" />)}
          </div>
        )
      ) : (
        <form onSubmit={submit} className="card mt-8 grid animate-slide-up gap-5 p-6 sm:p-8">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" value={profile.email} disabled className="field bg-neutral-50 text-neutral-500" />
          </div>
          <div>
            <label className="label" htmlFor="fullName">Full name</label>
            <input id="fullName" value={profile.fullName} onChange={set('fullName')} required minLength={2} maxLength={80} className="field" />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone / WhatsApp <span className="font-normal text-neutral-400">(optional)</span></label>
            <input id="phone" value={profile.phone} onChange={set('phone')} maxLength={20} placeholder="+91 94190 37261" inputMode="tel" className="field" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="hostel">Hostel <span className="font-normal text-neutral-400">(optional)</span></label>
              <input id="hostel" value={profile.hostel} onChange={set('hostel')} maxLength={80} placeholder="e.g. Chenab Hostel" className="field" />
            </div>
            <div>
              <label className="label" htmlFor="branch">Branch & year <span className="font-normal text-neutral-400">(optional)</span></label>
              <input id="branch" value={profile.branch} onChange={set('branch')} maxLength={80} placeholder="e.g. ECE, 3rd year" className="field" />
            </div>
          </div>

          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

          <div className="flex items-center justify-end gap-3">
            {saved && <span className="flex items-center gap-1 text-sm font-semibold text-primary-700"><Check className="h-4 w-4" /> Saved</span>}
            <button disabled={saving} className="btn-primary min-w-[8rem]">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Save profile'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
