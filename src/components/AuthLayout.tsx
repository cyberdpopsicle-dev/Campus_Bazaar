import type { ReactNode } from 'react'

export default function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1fr_1.1fr] md:items-center md:py-20">
      <div className="hidden md:block">
        <div className="relative">
          {[
            ['Thermodynamics, P.K. Nag', '₹240', '-rotate-6 left-0 top-0'],
            ['Hero Sprint cycle', '₹3,150', 'rotate-3 left-24 top-28'],
            ['Room heater, 1500W', '₹680', '-rotate-2 left-4 top-56'],
          ].map(([name, price, pos]) => (
            <div key={name} className={`card absolute w-56 animate-fade-in p-4 ${pos}`}>
              <p className="text-sm font-bold text-neutral-800">{name}</p>
              <span className="mt-2 inline-block rounded-lg bg-accent-500 px-2.5 py-1 text-sm font-extrabold text-white shadow-[0_2px_0_0_#c3440c]">{price}</span>
            </div>
          ))}
          <div className="h-80" />
        </div>
      </div>
      <div className="card animate-slide-up p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">{title}</h1>
        <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
