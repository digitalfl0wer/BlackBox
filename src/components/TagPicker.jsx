function resolveSelectedTags(selectedTags, value) {
  if (Array.isArray(selectedTags)) {
    return selectedTags
  }

  if (Array.isArray(value)) {
    return value
  }

  return []
}

export default function TagPicker({
  options = [],
  selectedTags,
  value,
  onChange,
}) {
  const selected = resolveSelectedTags(selectedTags, value)

  function handleToggle(tag) {
    const nextSelection = selected.includes(tag)
      ? selected.filter((existing) => existing !== tag)
      : [...selected, tag]

    if (typeof onChange === 'function') {
      onChange(nextSelection)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((tag) => {
        const isSelected = selected.includes(tag)

        return (
          <button
            key={tag}
            type="button"
            onClick={() => handleToggle(tag)}
            className={`min-h-touch rounded-chip border px-4 py-2 text-sm transition ${
              isSelected
                ? 'border-unity-amber/70 bg-unity-amber/90 text-void-black shadow-amber-glow'
                : 'border-divider-gray bg-void-black/55 text-silver-white hover:border-memory-violet/55'
            }`}
            aria-pressed={isSelected}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}
