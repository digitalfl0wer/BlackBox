import React from 'react'

const screenModules = import.meta.glob('../screens/*.jsx', { eager: true })

function MissingScreen({ name }) {
  return (
    <main className="min-h-screen bg-void-black px-4 py-8 text-silver-white">
      <div className="mx-auto max-w-xl rounded-xl border border-neutral-gray/40 bg-slate-black p-6">
        <p className="text-sm uppercase tracking-widest text-neutral-gray">Screen Placeholder</p>
        <h1 className="mt-3 text-2xl font-semibold text-silver-white">{name}</h1>
        <div className="mt-4 rounded-md bg-unity-amber px-3 py-2 text-void-black">
          Tailwind custom color token check: <span className="font-semibold">unity-amber</span>
        </div>
      </div>
    </main>
  )
}

export function getScreenComponent(name) {
  const entry = Object.entries(screenModules).find(([path]) =>
    path.endsWith(`/${name}.jsx`)
  )

  if (!entry || !entry[1] || !entry[1].default) {
    return () => <MissingScreen name={name} />
  }

  return entry[1].default
}
