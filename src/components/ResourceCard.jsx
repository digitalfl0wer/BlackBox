const CATEGORY_STYLES = {
  'Police Encounter': 'border-memory-violet/45 bg-memory-violet/12 text-silver-white',
  'Workplace Concern': 'border-memory-violet/45 bg-memory-violet/12 text-silver-white',
  'Relationship Safety': 'border-unity-amber/50 bg-unity-amber/16 text-silver-white',
  'Boundary / Consent Concern': 'border-unity-amber/50 bg-unity-amber/16 text-silver-white',
  'Public Harassment': 'border-memory-violet/45 bg-memory-violet/12 text-silver-white',
  'Stalking / Unwanted Contact': 'border-alert-red/35 bg-alert-red/12 text-silver-white',
  'Digital Safety': 'border-memory-violet/45 bg-memory-violet/12 text-silver-white',
  'Exploitation / Restricted Movement': 'border-alert-red/35 bg-alert-red/12 text-silver-white',
  'Medical Concern': 'border-safety-green/45 bg-safety-green/10 text-silver-white',
  Other: 'border-divider-gray bg-void-black/45 text-silver-white',
}

function resolveResource({
  resource,
  name,
  category,
  description,
  url,
}) {
  if (resource && typeof resource === 'object') {
    return {
      name: resource.name,
      category: resource.category,
      description: resource.description,
      url: resource.url,
    }
  }

  return { name, category, description, url }
}

export default function ResourceCard(props) {
  const resource = resolveResource(props)
  const styleClass = CATEGORY_STYLES[resource.category] || CATEGORY_STYLES.Other

  return (
    <article className="rounded-card border border-divider-gray bg-panel-black/85 p-4 shadow-panel-glow backdrop-blur-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-base font-semibold text-silver-white">{resource.name || 'Support Resource'}</p>
        <span className={`rounded-chip border px-3 py-1 text-xs font-medium ${styleClass}`}>
          {resource.category || 'General'}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-silver-white/88">
        {resource.description || 'No description available for this resource.'}
      </p>

      {resource.url ? (
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          className="bb-btn-primary mt-4"
        >
          Visit Resource
        </a>
      ) : null}
    </article>
  )
}
