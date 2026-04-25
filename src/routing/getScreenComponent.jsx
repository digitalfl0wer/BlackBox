import React from 'react'

const screenModules = import.meta.glob('../screens/*.jsx', { eager: true })

function MissingScreen({ name }) {
  return (
    <main className="min-h-screen bg-bb-black px-4 py-8 text-bb-offwhite">
      <div className="mx-auto max-w-xl rounded-xl border border-bb-sage/40 bg-bb-black p-6">
        <p className="text-sm uppercase tracking-widest text-bb-sage">Screen Placeholder</p>
        <h1 className="mt-3 text-2xl font-semibold text-bb-offwhite">{name}</h1>
        <div className="mt-4 rounded-md bg-bb-amber px-3 py-2 text-bb-black">
          Tailwind custom color token check: <span className="font-semibold">bb-amber</span>
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
