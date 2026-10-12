import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Home, Mail, MapPin, Phone, RotateCcw, Trash2 } from 'lucide-react'
import ImagePlaceholder from '../components/ImagePlaceholder'
import { useAuth } from '../context/AuthContext'
import { api, ApiError, formatPrice, imageUrl, timeAgo, type ListingDetail } from '../lib/api'

export default function ListingDetailPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [error, setError] = useState<{ message: string; status: number } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setListing(null)
    setError(null)
    api
      .listing(id)
      .then(setListing)
      .catch((e: ApiError) => setError({ message: e.message, status: e.status }))
  }, [id, user?.id])

  const toggleSold = async () => {
    if (!listing) return
    setBusy(true)
    try {
      const updated = await api.setStatus(listing.id, listing.status === 'sold' ? 'active' : 'sold')
      setListing({ ...listing, status: updated.status })
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!listing || !confirm('Delete this listing? This cannot be undone.')) return
    setBusy(true)
    try {
      await api.deleteListing(listing.id)
      navigate('/my-listings')
    } catch (e) {
      alert((e as Error).message)
      setBusy(false)
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-lg font-bold text-neutral-900">{error.status === 404 ? 'This listing is gone' : 'Could not load listing'}</p>
        <p className="mt-1 text-sm text-neutral-600">{error.status === 404 ? 'It may have been deleted by the seller.' : error.message}</p>
        <Link to="/" className="btn-primary mt-6">Browse other items</Link>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr]">
        <div className="skeleton aspect-[4/3] w-full rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-10 w-1/3" />
          <div className="skeleton h-32 w-full" />
        </div>
      </div>
    )
  }

  const src = imageUrl(listing.imageKey)
  const whatsapp = listing.contact?.phone.replace(/[^\d]/g, '')

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
        <div className="card relative animate-fade-in overflow-hidden">
          <div className="aspect-[4/3] bg-neutral-100">
            {src ? <img src={src} alt={listing.title} className="h-full w-full object-contain" /> : <ImagePlaceholder category={listing.category} />}
          </div>
          {listing.status === 'sold' && (
            <span className="absolute left-4 top-4 -rotate-6 rounded-md bg-neutral-900 px-3 py-1 text-sm font-extrabold uppercase tracking-widest text-white">Sold</span>
          )}
        </div>

        <div className="animate-slide-up">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <Link to={`/?category=${encodeURIComponent(listing.category)}`} className="rounded-full bg-primary-50 px-2.5 py-1 text-primary-800 hover:bg-primary-100">
              {listing.category}
            </Link>
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-700">{listing.condition}</span>
            <span className="text-neutral-400">Listed {timeAgo(listing.createdAt)}</span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900">{listing.title}</h1>
          <p className="mt-4 inline-block -rotate-1 rounded-xl bg-accent-500 px-4 py-2 text-3xl font-extrabold text-white shadow-[0_3px_0_0_#c3440c]">
            {formatPrice(listing.price)}
          </p>

          {listing.location && (
            <p className="mt-5 flex items-center gap-2 text-sm text-neutral-600">
              <MapPin className="h-4 w-4 text-primary-700" /> Pickup: {listing.location}
            </p>
          )}

          {listing.description && (
            <div className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Details</h2>
              <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-neutral-700">{listing.description}</p>
            </div>
          )}

          <div className="card mt-8 p-5">
            {listing.isOwner ? (
              <>
                <p className="text-sm font-bold text-neutral-900">This is your listing</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={toggleSold} disabled={busy} className="btn-primary">
                    {listing.status === 'sold' ? <><RotateCcw className="h-4 w-4" /> Mark as available</> : <><CheckCircle2 className="h-4 w-4" /> Mark as sold</>}
                  </button>
                  <button onClick={remove} disabled={busy} className="btn-danger">
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-100 font-bold text-primary-800">
                    {listing.sellerName.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-xs text-neutral-500">Sold by</p>
                    <p className="font-bold text-neutral-900">{listing.sellerName}</p>
                  </div>
                </div>
                {listing.contact ? (
                  <div className="mt-4 space-y-2 text-sm">
                    {listing.contact.hostel && (
                      <p className="flex items-center gap-2 text-neutral-600"><Home className="h-4 w-4 text-neutral-400" /> {listing.contact.hostel}</p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {whatsapp && (
                        <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi! Is "${listing.title}" on Campus Bazaar still available?`)}`} target="_blank" rel="noreferrer" className="btn-primary">
                          <Phone className="h-4 w-4" /> WhatsApp
                        </a>
                      )}
                      {listing.contact.email && (
                        <a href={`mailto:${listing.contact.email}?subject=${encodeURIComponent(`Campus Bazaar: ${listing.title}`)}`} className="btn-ghost">
                          <Mail className="h-4 w-4" /> Email seller
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-sm text-neutral-600">Sign in to see the seller's contact details.</p>
                    <Link to="/signin" state={{ from: `/listing/${listing.id}` }} className="btn-primary mt-3">Sign in to contact</Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
