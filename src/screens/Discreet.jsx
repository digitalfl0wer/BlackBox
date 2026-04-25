import { useEffect, useRef, useState } from 'react'

const today = new Date()
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const dateStr = `${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}`

const DEFAULT_HABITS = [
  { id: 'water', emoji: '💧', label: 'Water', goal: 8, unit: 'glasses' },
  { id: 'sleep', emoji: '🌙', label: 'Sleep', goal: 8, unit: 'hrs' },
  { id: 'movement', emoji: '🚶', label: 'Move', goal: 30, unit: 'min' },
  { id: 'gratitude', emoji: '✨', label: 'Grateful', goal: 1, unit: 'entry' },
]

const DEFAULT_TASKS = [
  { id: 1, text: 'Hydration', done: false },
  { id: 2, text: 'Meal planning', done: false },
  { id: 3, text: 'Errands', done: false },
  { id: 4, text: 'Check messages', done: false },
  { id: 5, text: 'Evening wind-down', done: false },
]

export default function Discreet({ onExit }) {
  const [tasks, setTasks] = useState(DEFAULT_TASKS)
  const [notes, setNotes] = useState('')
  const [habits, setHabits] = useState({
    water: 0,
    sleep: 0,
    movement: 0,
    gratitude: 0,
  })
  const [newTask, setNewTask] = useState('')
  const [holding, setHolding] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const holdTimer = useRef(null)
  const holdInterval = useRef(null)

  const greetings = ['Good morning', 'Good afternoon', 'Good evening']
  const hour = today.getHours()
  const greeting = hour < 12 ? greetings[0] : hour < 17 ? greetings[1] : greetings[2]

  const doneTasks = tasks.filter((task) => task.done).length
  const progressPct = tasks.length ? (doneTasks / tasks.length) * 100 : 0

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    )
  }

  function addTask() {
    if (!newTask.trim()) return
    setTasks((current) => [...current, { id: Date.now(), text: newTask.trim(), done: false }])
    setNewTask('')
  }

  function incrementHabit(id) {
    const goal = DEFAULT_HABITS.find((habit) => habit.id === id)?.goal || 0
    setHabits((current) => ({ ...current, [id]: Math.min(current[id] + 1, goal) }))
  }

  function startHold() {
    if (holdTimer.current || holdInterval.current) return
    setHolding(true)
    let progress = 0
    holdInterval.current = window.setInterval(() => {
      progress += 3.33
      setHoldProgress(Math.min(progress, 100))
    }, 100)
    holdTimer.current = window.setTimeout(() => {
      if (holdInterval.current) {
        window.clearInterval(holdInterval.current)
        holdInterval.current = null
      }
      holdTimer.current = null
      if (typeof onExit === 'function') {
        onExit()
      }
    }, 3000)
  }

  function cancelHold() {
    setHolding(false)
    setHoldProgress(0)
    if (holdTimer.current) {
      window.clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
    if (holdInterval.current) {
      window.clearInterval(holdInterval.current)
      holdInterval.current = null
    }
  }

  useEffect(() => () => cancelHold(), [])

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-[#F9F9F9] text-[#1a1a2e] [font-family:-apple-system,'Helvetica_Neue',sans-serif]">
      <div className="discreet-shell mx-auto flex min-h-0 w-full flex-1 flex-col bg-[#F9F9F9]">
        <header
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={startHold}
          onTouchEnd={cancelHold}
          onTouchCancel={cancelHold}
          className={`relative cursor-default select-none overflow-hidden border-b border-[#eee] px-5 pb-4 pt-5 ${holding ? 'bg-[#e8f5e9]' : 'bg-white'}`}
        >
          {holding ? (
            <div className="absolute left-0 top-0 h-[3px] rounded-r-sm bg-[#4CAF50]" style={{ width: `${holdProgress}%` }} />
          ) : null}

          <div className="mb-3 flex items-start justify-between">
            <div>
              <p className="mb-0.5 text-[13px] text-[#888]">{greeting} ☀️</p>
              <p className="text-[20px] font-bold text-[#1a1a2e]">{dateStr}</p>
            </div>
            <div className="rounded-full bg-[#F0F4FF] px-3 py-1.5 text-sm font-semibold text-[#5572FF]">72°F</div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="shrink-0 whitespace-nowrap text-xs text-[#888]">
              {doneTasks}/{tasks.length} tasks complete
            </span>
            <div className="h-1 flex-1 overflow-hidden rounded bg-[#eee]">
              <div className="h-full rounded bg-[#4CAF50] transition-[width] duration-300" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[90px]">
          <section className="mt-6">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#888]">Daily Habits</p>
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_HABITS.map((habit) => (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => incrementHabit(habit.id)}
                  className="flex flex-col items-center gap-0.5 rounded-xl border border-[#f0f0f0] bg-white px-2 py-3 text-center"
                >
                  <span className="text-lg">{habit.emoji}</span>
                  <span className="text-base font-bold text-[#1a1a2e]">
                    {habits[habit.id]}<span className="text-[11px] font-normal text-[#ccc]">/{habit.goal}</span>
                  </span>
                  <span className="text-[10px] text-[#888]">{habit.unit}</span>
                  <div className="mt-1 h-[3px] w-full overflow-hidden rounded bg-[#eee]">
                    <div className="h-full rounded bg-[#4CAF50] transition-[width] duration-300" style={{ width: `${(habits[habit.id] / habit.goal) * 100}%` }} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#888]">Today&apos;s List</p>
            <div className="overflow-hidden rounded-2xl border border-[#f0f0f0] bg-white">
              {tasks.map((task, index) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${index !== tasks.length - 1 ? 'border-b border-[#f0f0f0]' : ''}`}
                >
                  <div className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 ${task.done ? 'border-[#4CAF50] bg-[#4CAF50]' : 'border-[#ddd]'}`}>
                    {task.done ? <span className="text-xs font-bold text-white">✓</span> : null}
                  </div>
                  <span className={`text-[15px] ${task.done ? 'text-[#bbb] line-through' : 'text-[#1a1a2e]'}`}>{task.text}</span>
                </button>
              ))}

              <div className="flex items-center gap-2 px-4 py-2.5">
                <input
                  className="h-8 flex-1 border-0 bg-transparent text-sm text-[#888] outline-none"
                  placeholder="Add a task..."
                  value={newTask}
                  onChange={(event) => setNewTask(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') addTask()
                  }}
                />
                <button
                  type="button"
                  onClick={addTask}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4CAF50] text-lg leading-none text-white"
                >
                  +
                </button>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#888]">Notes</p>
            <textarea
              rows={5}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Write reminders for the day..."
              className="w-full resize-none rounded-2xl border border-[#f0f0f0] bg-white p-3.5 text-[15px] leading-relaxed text-[#1a1a2e] outline-none"
            />
          </section>

          <section className="mt-6">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#888]">This Week</p>
            <div className="flex gap-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                const isToday = index === today.getDay()
                const dayNum = today.getDate() - today.getDay() + index
                return (
                  <div
                    key={`${day}-${index}`}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-[10px] border px-1 py-2 ${isToday ? 'border-[#4CAF50] bg-[#4CAF50]' : 'border-[#f0f0f0] bg-white'}`}
                  >
                    <span className={`text-[10px] font-semibold ${isToday ? 'text-white/90' : 'text-[#888]'}`}>{day}</span>
                    <span className={`text-sm font-bold ${isToday ? 'text-white' : 'text-[#1a1a2e]'}`}>{dayNum}</span>
                  </div>
                )
              })}
            </div>
          </section>

          <p className="h-7 py-2 text-center text-xs text-[#4CAF50]">{holding ? 'Keep holding...' : ''}</p>
        </div>
      </div>

      <nav className="discreet-shell fixed bottom-0 left-1/2 z-[10000] flex w-full -translate-x-1/2 border-t border-[#eee] bg-white pb-[max(env(safe-area-inset-bottom),8px)] pt-2">
        {[
          { icon: '🏠', label: 'Home' },
          { icon: '📋', label: 'Tasks' },
          { icon: '📓', label: 'Notes' },
          { icon: '⚙️', label: 'Settings' },
        ].map((item, index) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-1 py-1">
            <span className="text-xl">{item.icon}</span>
            <span className={`text-[10px] font-medium ${index === 1 ? 'text-[#1a1a2e]' : 'text-[#888]'}`}>{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  )
}
