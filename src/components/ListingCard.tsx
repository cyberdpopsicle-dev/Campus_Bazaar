import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { formatPrice, imageUrl, timeAgo, type Listing } from '../lib/api'
import ImagePlaceholder from './ImagePlaceholder'

export default function ListingCard({ listing, index = 0 }: { listing: Listing; index?: number }) {
  const src = imageUrl(listing.imageKey)
  return (
    <Link
      to={`/listing/${listing.id}`}
      className="card group relative flex animate-slide-up flex-col overflow-hidden opacity-0 transition hover:-translate-y-1 hover:shadow-[0_12px_30px_-12px_rgba(15,23,42,0.25)]"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms`, animationFillMode: 'forwards' }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        {src ? (
          <img src={src} alt={listing.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <ImagePlaceholder category={listing.category} />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-neutral-700 backdrop-blur">
          {listing.condition}
        </span>
        {listing.status === 'sold' && (
          <div className="absolute inset-0 grid place-items-center bg-neutral-900/50">
            <span className="-rotate-6 rounded-md border-2 border-white px-4 py-1 text-lg font-extrabold uppercase tracking-widest text-white">Sold</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 font-bold leading-snug text-neutral-900">{listing.title}</h3>
          <span className="shrink-0 rotate-2 rounded-lg bg-accent-500 px-2.5 py-1 text-sm font-extrabold text-white shadow-[0_2px_0_0_#c3440c] transition group-hover:rotate-0">
            {formatPrice(listing.price)}
          </span>
        </div>
        <p className="text-xs font-semibold text-primary-700">{listing.category}</p>
        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-neutral-500">
          <span className="flex min-w-0 items-center gap-1">
            {listing.location && (
              <>
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{listing.location}</span>
              </>
            )}
          </span>
          <span className="shrink-0">{timeAgo(listing.createdAt)}</span>
        </div>
      </div>
    </Link>
  )
}
