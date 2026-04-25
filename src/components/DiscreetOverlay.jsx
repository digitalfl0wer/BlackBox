import { useRef, useState } from 'react'

export default function DiscreetOverlay({ onExit }) {
  const [notes, setNotes] = useState('')
  const [tasks, setTasks] = useState([
    { id: 'water', label: 'Hydration', checked: false },
    { id: 'meals', label: 'Meal planning', checked: false },
    { id: 'errands', label: 'Errands', checked: false },
  ])
  const tapTimesRef = useRef([])

  function handleTitleTap() {
    const now = Date.now()
    const recentTaps = [...tapTimesRef.current, now].filter((timestamp) => now - timestamp <= 1500)
    tapTimesRef.current = recentTaps

    if (recentTaps.length >= 3 && typeof onExit === 'function') {
      tapTimesRef.current = []
      onExit()
    }
  }

  function handleTaskToggle(id) {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id ? { ...task, checked: !task.checked } : task
      )
    )
  }

  return (
    <section className="bb-panel mx-auto w-full max-w-lg text-silver-white">
      <h2
        role="button"
        tabIndex={0}
        onClick={handleTitleTap}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleTitleTap()
          }
        }}
        className="text-xl font-semibold tracking-tight"
      >
        Daily Notes
      </h2>
      <p className="mt-1 text-sm text-mist-gray">
        {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
      </p>

      <div className="mt-5 space-y-2">
        {tasks.map((task) => (
          <label
            key={task.id}
            className="flex min-h-touch items-center gap-3 rounded-control border border-divider-gray bg-void-black/60 px-3 py-2 text-sm"
          >
            <input
              type="checkbox"
              checked={task.checked}
              onChange={() => handleTaskToggle(task.id)}
              className="h-4 w-4 accent-neutral-gray"
            />
            <span>{task.label}</span>
          </label>
        ))}
      </div>

      <label className="mt-5 block text-sm text-silver-white">
        Notes
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Write reminders for the day."
          className="bb-textarea mt-2 min-h-32"
        />
      </label>
    </section>
  )
}
