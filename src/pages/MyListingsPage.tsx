import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, PackageOpen, Plus, RotateCcw, Trash2 } from 'lucide-react'
import ImagePlaceholder from '../components/ImagePlaceholder'
import { api, formatPrice, imageUrl, timeAgo, type Listing } from '../lib/api'

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    api.myListings().then(setListings).catch((e: Error) => setError(e.message))
  }, [])

  const toggle = async (l: Listing) => {
    setBusyId(l.id)
    try {
      const updated = await api.setStatus(l.id, l.status === 'sold' ? 'active' : 'sold')
      setListings((all) => all?.map((x) => (x.id === l.id ? { ...x, status: updated.status } : x)) ?? null)
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (l: Listing) => {
    if (!confirm(`Delete "${l.title}"? This cannot be undone.`)) return
    setBusyId(l.id)
    try {
      await api.deleteListing(l.id)
      setListings((all) => all?.filter((x) => x.id !== l.id) ?? null)
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  const active = listings?.filter((l) => l.status === 'active').length ?? 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">My listings</h1>
          {listings && listings.length > 0 && (
            <p className="mt-1 text-neutral-600">{active} active · {listings.length - active} sold</p>
          )}
        </div>
        <Link to="/sell" className="btn-accent"><Plus className="h-4 w-4" /> New listing</Link>
      </div>

      <div className="mt-8 space-y-3">
        {error ? (
          <p className="card p-6 text-center font-semibold text-red-600">{error}</p>
        ) : !listings ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 w-full rounded-2xl" />)
        ) : listings.length === 0 ? (
          <div className="card p-10 text-center">
            <PackageOpen className="mx-auto h-10 w-10 text-neutral-300" />
            <p className="mt-4 font-bold text-neutral-900">You haven't listed anything yet</p>
            <p className="mt-1 text-sm text-neutral-600">That calculator from first semester? Someone needs it.</p>
            <Link to="/sell" className="btn-primary mt-5">List your first item</Link>
          </div>
        ) : (
          listings.map((l, i) => {
            const src = imageUrl(l.imageKey)
            return (
              <div
                key={l.id}
                className={`card flex animate-slide-up items-center gap-4 p-3 opacity-0 ${l.status === 'sold' ? 'bg-neutral-50' : ''}`}
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'forwards' }}
              >
                <Link to={`/listing/${l.id}`} className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                  {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : <ImagePlaceholder category={l.category} />}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/listing/${l.id}`} className="line-clamp-1 font-bold text-neutral-900 hover:text-primary-800">{l.title}</Link>
                  <p className="mt-0.5 text-sm">
                    <span className="font-extrabold text-accent-600">{formatPrice(l.price)}</span>
                    <span className="text-neutral-400"> · {timeAgo(l.createdAt)}</span>
                  </p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${l.status === 'sold' ? 'bg-neutral-200 text-neutral-600' : 'bg-primary-100 text-primary-800'}`}>
                    {l.status === 'sold' ? 'Sold' : 'Active'}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  <button onClick={() => toggle(l)} disabled={busyId === l.id} className="btn-ghost px-3 py-2 text-xs" title={l.status === 'sold' ? 'Mark as available' : 'Mark as sold'}>
                    {l.status === 'sold' ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    <span className="hidden sm:inline">{l.status === 'sold' ? 'Relist' : 'Mark sold'}</span>
                  </button>
                  <button onClick={() => remove(l)} disabled={busyId === l.id} className="btn-danger px-3 py-2 text-xs" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
