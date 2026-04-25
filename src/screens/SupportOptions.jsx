import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  {
    id: 'now',
    label: 'In This Moment',
    eyebrow: 'IMMEDIATE',
    accent: '#FF4757',
    desc: 'If you are in immediate danger, call 911. These resources offer immediate support.',
    resources: [
      {
        name: 'Crisis Text Line',
        desc: 'Text HOME to 741741 - free, 24/7 crisis support via text.',
        action: 'Text Now',
        href: 'sms:741741?body=HOME',
        tag: 'Crisis Support',
      },
      {
        name: 'National DV Hotline',
        desc: '1-800-799-7233 - confidential support for domestic violence survivors.',
        action: 'Call',
        href: 'tel:18007997233',
        tag: 'Domestic Violence',
      },
      {
        name: 'RAINN Hotline',
        desc: '1-800-656-4673 - sexual assault support, 24 hours a day.',
        action: 'Call',
        href: 'tel:18006564673',
        tag: 'Sexual Assault',
      },
      {
        name: 'StrongHearts Native Helpline',
        desc: '1-844-762-8483 - culturally specific DV support.',
        action: 'Call',
        href: 'tel:18447628483',
        tag: 'Culturally Specific',
      },
    ],
  },
  {
    id: 'after',
    label: 'After Something Happens',
    eyebrow: 'FOLLOW-UP',
    accent: '#F5A623',
    desc: 'When the moment passes - organizations to help you process, document, and act.',
    resources: [
      {
        name: 'NAACP Legal Defense Fund',
        desc: 'Civil rights legal support and representation.',
        action: 'Visit',
        href: 'https://www.naacpldf.org',
        tag: 'Legal Defense',
      },
      {
        name: 'ACLU',
        desc: 'Know your rights. Find local legal help and advocacy.',
        action: 'Visit',
        href: 'https://www.aclu.org',
        tag: 'Civil Liberties',
      },
      {
        name: 'Equal Employment Opportunity Commission',
        desc: 'File workplace harassment or discrimination complaints.',
        action: 'Visit',
        href: 'https://www.eeoc.gov',
        tag: 'Workplace',
      },
      {
        name: 'National Alliance for Eating Disorders',
        desc: "1-866-662-1235 - if you're struggling with disordered eating alongside stress.",
        action: 'Call',
        href: 'tel:18666621235',
        tag: 'Mental Health',
      },
      {
        name: 'Therapy for Black Girls',
        desc: 'Find a culturally competent Black therapist near you.',
        action: 'Visit',
        href: 'https://therapyforblackgirls.com',
        tag: 'Mental Health',
      },
      {
        name: 'Therapy for Black Men',
        desc: 'Mental health directory specifically for Black men and boys.',
        action: 'Visit',
        href: 'https://therapyforblackmen.org',
        tag: 'Mental Health',
      },
    ],
  },
  {
    id: 'rights',
    label: 'Know Your Rights',
    eyebrow: 'EDUCATION',
    accent: '#7B4FFF',
    desc: 'Understanding your rights is the first step in preserving your truth.',
    resources: [
      {
        name: 'Recording Laws by State',
        desc: "Some states require all-party consent. Know your state's law before using recordings.",
        action: 'Learn',
        href: 'https://www.rcfp.org/reporters-recording-guide/',
        tag: 'Recording Laws',
      },
      {
        name: 'Police Encounters - Know Your Rights',
        desc: 'ACLU guide: what to say, what not to say, and what officers can and cannot do.',
        action: 'Read',
        href: 'https://www.aclu.org/know-your-rights/stopped-by-police',
        tag: 'Police Encounter',
      },
      {
        name: 'Workplace Rights',
        desc: 'What counts as harassment, retaliation, and how to document it properly.',
        action: 'Read',
        href: 'https://www.eeoc.gov/harassment',
        tag: 'Workplace',
      },
      {
        name: 'Documentation Tips',
        desc: 'How to document incidents effectively: dates, witnesses, exact words used.',
        action: 'Learn',
        tag: 'Documentation',
        tip: "Write down what happened as soon as it's safe. Include: exact date and time, exact words used, who was present, any physical evidence, and how it made you feel. Your notes are valid.",
      },
    ],
  },
]

function linkAttrs(href) {
  if (!href) return {}
  if (href.startsWith('http')) return { target: '_blank', rel: 'noopener noreferrer' }
  return {}
}

function ResourceCard({ resource, accent, expanded, onToggleTip }) {
  return (
    <article className="support-resource-card" style={{ '--support-accent': accent }}>
      <div className="support-resource-top">
        <div className="support-resource-left">
          <span className="support-resource-tag">{resource.tag}</span>
          <p className="support-resource-name">{resource.name}</p>
          <p className="support-resource-desc">{resource.desc}</p>
        </div>

        {resource.href ? (
          <a href={resource.href} {...linkAttrs(resource.href)} className="support-resource-action">
            {resource.action} →
          </a>
        ) : null}

        {resource.tip ? (
          <button type="button" className="support-resource-action" onClick={onToggleTip}>
            {expanded ? 'Close' : `${resource.action} →`}
          </button>
        ) : null}
      </div>

      {expanded && resource.tip ? (
        <div className="support-tip-box">
          <p className="support-tip-text">{resource.tip}</p>
        </div>
      ) : null}
    </article>
  )
}

export default function SupportOptions({ onBack }) {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('now')
  const [expandedTip, setExpandedTip] = useState(null)
  const section = SECTIONS.find((entry) => entry.id === activeSection)

  function handleBack() {
    if (typeof onBack === 'function') {
      onBack()
      return
    }
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate('/home', { replace: true })
  }

  return (
    <main className="support-page">
      <div className="support-glow-amber" />
      <div className="support-glow-purple" />

      <section className="support-shell">
        <header className="support-header">
          <button type="button" className="support-back" onClick={handleBack}>
            ← Back
          </button>
          <p className="support-eyebrow">SUPPORT & RESOURCES</p>
        </header>

        <h1 className="support-title">Support Options</h1>
        <p className="support-subtitle">
          You don&apos;t have to navigate this alone. Find the right support for where you are right now.
        </p>

        <div className="support-tabs" role="tablist" aria-label="Support sections">
          {SECTIONS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={activeSection === entry.id}
              className={`support-tab ${activeSection === entry.id ? 'is-active' : ''}`}
              style={{ '--support-accent': entry.accent }}
              onClick={() => {
                setActiveSection(entry.id)
                setExpandedTip(null)
              }}
            >
              <span className="support-tab-dot" />
              {entry.label}
            </button>
          ))}
        </div>

        <section className="support-section">
          <div className="support-accent-bar" style={{ '--support-accent': section.accent }} />
          <div className="support-section-meta">
            <span className="support-section-eyebrow" style={{ color: section.accent }}>
              {section.eyebrow}
            </span>
            <p className="support-section-desc">{section.desc}</p>
          </div>

          <div className="support-resource-list">
            {section.resources.map((resource, index) => (
              <ResourceCard
                key={`${resource.name}-${index}`}
                resource={resource}
                accent={section.accent}
                expanded={expandedTip === index}
                onToggleTip={() => setExpandedTip(expandedTip === index ? null : index)}
              />
            ))}
          </div>
        </section>

        <div className="support-disclaimer">
          <span className="support-disclaimer-icon">◈</span>
          <p className="support-disclaimer-text">
            Black Boxx does not endorse specific organizations. These are widely recognized resources.
            Verify current availability before use. This is not legal advice.
          </p>
        </div>
      </section>
    </main>
  )
}
