export const CATEGORIES = [
  'Books & Notes',
  'Electronics',
  'Hostel Essentials',
  'Cycles & Transport',
  'Clothing',
  'Sports & Fitness',
  'Stationery',
  'Other',
] as const

export const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'] as const

export type Listing = {
  id: number
  sellerId: string
  sellerName: string
  title: string
  description: string
  price: number
  category: string
  condition: string
  location: string
  imageKey: string | null
  status: 'active' | 'sold'
  createdAt: string
}

export type ListingDetail = Listing & {
  isOwner: boolean
  contact: { email: string; phone: string; hostel: string } | null
}

export type Profile = {
  fullName: string
  email: string
  phone: string
  hostel: string
  branch: string
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'same-origin', ...init })
  if (res.status === 204) return undefined as T
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(body?.error ?? 'Something went wrong. Please try again.', res.status)
  return body as T
}

const jsonInit = (method: string, data: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})

export const api = {
  listings: (params: { q?: string; category?: string; sort?: string }) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][])
    return request<Listing[]>(`/api/listings?${qs}`)
  },
  listing: (id: string | number) => request<ListingDetail>(`/api/listings/${id}`),
  createListing: (form: FormData) => request<Listing>('/api/listings', { method: 'POST', body: form }),
  setStatus: (id: number, status: Listing['status']) => request<Listing>(`/api/listings/${id}`, jsonInit('PATCH', { status })),
  deleteListing: (id: number) => request<void>(`/api/listings/${id}`, { method: 'DELETE' }),
  myListings: () => request<Listing[]>('/api/my-listings'),
  profile: () => request<Profile>('/api/profile'),
  saveProfile: (profile: Omit<Profile, 'email'>) => request<Profile>('/api/profile', jsonInit('PUT', profile)),
}

export const imageUrl = (key: string | null) => (key ? `/api/images/${key}` : null)

export const formatPrice = (price: number) =>
  price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`

export function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  const steps: [number, string][] = [
    [60 * 60 * 24 * 365, 'y'],
    [60 * 60 * 24 * 30, 'mo'],
    [60 * 60 * 24 * 7, 'w'],
    [60 * 60 * 24, 'd'],
    [60 * 60, 'h'],
    [60, 'm'],
  ]
  for (const [size, unit] of steps) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${unit} ago`
  }
  return 'just now'
}
