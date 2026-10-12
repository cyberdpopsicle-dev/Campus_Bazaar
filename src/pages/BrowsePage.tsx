import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Search, SearchX } from 'lucide-react'
import ListingCard from '../components/ListingCard'
import { useAuth } from '../context/AuthContext'
import { api, CATEGORIES, type Listing } from '../lib/api'

export default function BrowsePage() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const sort = params.get('sort') ?? ''

  const [query, setQuery] = useState(q)
  const [listings, setListings] = useState<Listing[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => setQuery(q), [q])

  useEffect(() => {
    let cancelled = false
    setListings(null)
    setError(null)
    api
      .listings({ q, category, sort })
      .then((rows) => !cancelled && setListings(rows))
      .catch((e: Error) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [q, category, sort])

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const filtered = Boolean(q || category)

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <section className="grid gap-8 pb-10 pt-10 md:grid-cols-[1.4fr_1fr] md:items-end md:pt-16">
        <div className="animate-fade-in">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary-700">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500" /> Hazratbal campus marketplace
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl md:text-6xl">
            Pass it on to the<br />
            <span className="relative inline-block text-primary-700">
              next batch
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden>
                <path d="M2 9 C 50 2, 150 2, 198 8" stroke="#fd7a14" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-5 max-w-lg text-base text-neutral-600 sm:text-lg">
            Textbooks, drafters, heaters, cycles and lab coats — buy and sell with fellow students, then meet up on campus.
          </p>
        </div>
        <div className="card relative rotate-1 animate-scale-in p-5 md:-mb-2">
          <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-accent-500 shadow-[0_2px_0_0_#c3440c]" />
          <p className="text-sm font-bold text-neutral-900">Moving out or upgrading?</p>
          <p className="mt-1 text-sm text-neutral-600">List an item in under a minute. Add a photo, set a price, done.</p>
          <Link to={user ? '/sell' : '/signup'} className="btn-primary mt-4 w-full">
            {user ? 'Sell an item' : 'Create a free account'} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="sticky top-16 z-30 -mx-4 bg-[#f7f5ef]/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            update('q', query.trim())
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for 'engineering drawing kit', 'cycle', 'kettle'…"
              className="field pl-10"
              aria-label="Search listings"
            />
          </div>
          <select value={sort} onChange={(e) => update('sort', e.target.value)} className="field w-auto" aria-label="Sort">
            <option value="">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
          <button className="btn-primary hidden sm:inline-flex">Search</button>
        </form>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {['', ...CATEGORIES].map((c) => (
            <button
              key={c || 'all'}
              onClick={() => update('category', c)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                category === c
                  ? 'border-primary-700 bg-primary-700 text-white'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary-300 hover:text-primary-800'
              }`}
            >
              {c || 'Everything'}
            </button>
          ))}
        </div>
      </section>

      <section className="pt-6">
        {error ? (
          <div className="card p-8 text-center">
            <p className="font-semibold text-red-600">{error}</p>
            <button onClick={() => update('q', q)} className="btn-ghost mt-4">Try again</button>
          </div>
        ) : !listings ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton aspect-[4/3] rounded-none" />
                <div className="space-y-2 p-4">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="card mx-auto max-w-md p-10 text-center">
            <SearchX className="mx-auto h-10 w-10 text-neutral-300" />
            <p className="mt-4 font-bold text-neutral-900">{filtered ? 'Nothing matches that yet' : 'The bazaar is just opening'}</p>
            <p className="mt-1 text-sm text-neutral-600">
              {filtered ? 'Try a different word or category.' : 'Be the first to list something your juniors will thank you for.'}
            </p>
            {filtered ? (
              <button onClick={() => setParams({}, { replace: true })} className="btn-ghost mt-5">Clear filters</button>
            ) : (
              <Link to={user ? '/sell' : '/signup'} className="btn-accent mt-5">List the first item</Link>
            )}
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-neutral-500">
              {listings.length} {listings.length === 1 ? 'item' : 'items'} {category && <>in <b className="text-neutral-700">{category}</b></>}
            </p>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {listings.map((l, i) => (
                <ListingCard key={l.id} listing={l} index={i} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
