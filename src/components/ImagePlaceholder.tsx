import { Bike, BookOpen, Dumbbell, Laptop, Lamp, Package, PenLine, Shirt } from 'lucide-react'

const ICONS: Record<string, typeof Package> = {
  'Books & Notes': BookOpen,
  Electronics: Laptop,
  'Hostel Essentials': Lamp,
  'Cycles & Transport': Bike,
  Clothing: Shirt,
  'Sports & Fitness': Dumbbell,
  Stationery: PenLine,
}

export default function ImagePlaceholder({ category }: { category: string }) {
  const Icon = ICONS[category] ?? Package
  return (
    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary-50 via-[#f3f1e8] to-accent-50">
      <Icon className="h-12 w-12 text-primary-700/40" strokeWidth={1.5} />
    </div>
  )
}
