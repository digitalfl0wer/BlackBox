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
            className={`min-h-touch rounded-chip border px-4 py-2 text-sm transition-colors ${
              isSelected
                ? 'border-unity-amber bg-unity-amber text-void-black'
                : 'border-neutral-gray/55 bg-slate-black text-silver-white'
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
