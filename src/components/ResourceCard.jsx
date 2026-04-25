const CATEGORY_STYLES = {
  'Police Encounter': 'border-neutral-gray/50 bg-surface-3 text-soft-sage',
  'Workplace Concern': 'border-neutral-gray/50 bg-surface-3 text-soft-sage',
  'Relationship Safety': 'border-unity-amber/45 bg-unity-amber/20 text-sand-ink',
  'Boundary / Consent Concern': 'border-unity-amber/45 bg-unity-amber/20 text-sand-ink',
  'Public Harassment': 'border-neutral-gray/50 bg-surface-3 text-soft-sage',
  'Stalking / Unwanted Contact': 'border-alert-red/35 bg-alert-red/12 text-silver-white',
  'Digital Safety': 'border-neutral-gray/50 bg-surface-3 text-soft-sage',
  'Exploitation / Restricted Movement': 'border-alert-red/35 bg-alert-red/12 text-silver-white',
  'Medical Concern': 'border-alert-red/35 bg-alert-red/12 text-silver-white',
  Other: 'border-neutral-gray/50 bg-surface-3 text-soft-sage',
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
    <article className="rounded-card border border-neutral-gray/35 bg-surface-1 p-4 sm:p-5">
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
          className="mt-4 inline-flex min-h-touch items-center justify-center rounded-control bg-unity-amber px-4 py-3 text-sm font-semibold text-void-black"
        >
          Visit Resource
        </a>
      ) : null}
    </article>
  )
}
