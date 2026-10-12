import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { api, CATEGORIES, CONDITIONS } from '../lib/api'

const MAX_BYTES = 5 * 1024 * 1024

export default function PostListingPage() {
  const navigate = useNavigate()
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!image) return setPreview(null)
    const url = URL.createObjectURL(image)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [image])

  const pickImage = (file: File | undefined) => {
    setError(null)
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('Please choose an image file.')
    if (file.size > MAX_BYTES) return setError('Photo must be 5 MB or smaller.')
    setImage(file)
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    form.delete('image')
    if (image) form.set('image', image)

    setSubmitting(true)
    try {
      const created = await api.createListing(form)
      navigate(`/listing/${created.id}`)
    } catch (err) {
      setError((err as Error).message)
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Sell an item</h1>
      <p className="mt-1 text-neutral-600">Good photos and an honest description sell things fastest.</p>

      <form onSubmit={submit} className="card mt-8 grid animate-slide-up gap-6 p-6 sm:p-8">
        <div>
          <span className="label">Photo</span>
          {preview ? (
            <div className="relative overflow-hidden rounded-xl border border-neutral-200">
              <img src={preview} alt="Preview" className="max-h-80 w-full bg-neutral-50 object-contain" />
              <button type="button" onClick={() => setImage(null)} className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow hover:bg-white" aria-label="Remove photo">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                pickImage(e.dataTransfer.files[0])
              }}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center transition hover:border-primary-400 hover:bg-primary-50/40"
            >
              <ImagePlus className="h-8 w-8 text-primary-700" />
              <span className="text-sm font-semibold text-neutral-700">Click or drop a photo here</span>
              <span className="text-xs text-neutral-500">JPEG, PNG, WebP or GIF · up to 5 MB</span>
              <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(e) => pickImage(e.target.files?.[0])} />
            </label>
          )}
        </div>

        <div>
          <label htmlFor="title" className="label">Title</label>
          <input id="title" name="title" required minLength={3} maxLength={100} placeholder="e.g. Engineering Drawing kit with mini drafter" className="field" />
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="price" className="label">Price (₹)</label>
            <input id="price" name="price" type="number" required min={0} max={10000000} step={1} inputMode="numeric" placeholder="0 for free" className="field" />
          </div>
          <div>
            <label htmlFor="category" className="label">Category</label>
            <select id="category" name="category" required defaultValue="" className="field">
              <option value="" disabled>Choose…</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="condition" className="label">Condition</label>
            <select id="condition" name="condition" required defaultValue="" className="field">
              <option value="" disabled>Choose…</option>
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="location" className="label">Pickup location <span className="font-normal text-neutral-400">(optional)</span></label>
          <input id="location" name="location" maxLength={100} placeholder="e.g. Jhelum Hostel, Main Gate, Library" className="field" />
        </div>

        <div>
          <label htmlFor="description" className="label">Description <span className="font-normal text-neutral-400">(optional)</span></label>
          <textarea id="description" name="description" rows={5} maxLength={2000} placeholder="How old is it? Any wear, missing parts, or extras included?" className="field resize-y" />
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost">Cancel</button>
          <button disabled={submitting} className="btn-accent min-w-[9rem]">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Publishing…</> : 'Publish listing'}
          </button>
        </div>
      </form>
    </div>
  )
}
