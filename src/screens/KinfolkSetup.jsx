import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const INITIAL_VALUES = {
  yourName: '',
  yourState: '',
  kinfolkName: '',
  kinfolkContact: '',
  preferredSignalMessage:
    'Hi, this is a Black Box Signal. Please check on me when you can.',
  consent: false,
}

export default function KinfolkSetup() {
  const navigate = useNavigate()
  const location = useLocation()

  const [values, setValues] = useState(INITIAL_VALUES)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const fieldErrors = useMemo(() => {
    if (!submitted) {
      return {}
    }

    return {
      yourName: !values.yourName.trim(),
      yourState: !values.yourState.trim(),
      kinfolkName: !values.kinfolkName.trim(),
      kinfolkContact: !values.kinfolkContact.trim(),
      preferredSignalMessage: !values.preferredSignalMessage.trim(),
      consent: !values.consent,
    }
  }, [submitted, values])

  function updateField(field, nextValue) {
    setValues((previous) => ({ ...previous, [field]: nextValue }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)

    const hasInvalidField =
      !values.yourName.trim() ||
      !values.yourState.trim() ||
      !values.kinfolkName.trim() ||
      !values.kinfolkContact.trim() ||
      !values.preferredSignalMessage.trim() ||
      !values.consent

    if (hasInvalidField) {
      setSubmitError('Please complete all required fields and confirm consent to continue.')
      return
    }

    const payload = {
      yourName: values.yourName.trim(),
      yourState: values.yourState.trim(),
      kinfolkName: values.kinfolkName.trim(),
      kinfolkContact: values.kinfolkContact.trim(),
      preferredSignalMessage: values.preferredSignalMessage.trim(),
      consent: true,
      savedAt: new Date().toISOString(),
    }

    window.localStorage.setItem('blackbox_kinfolk', JSON.stringify(payload))
    setSubmitError('')
    navigate('/home')
  }

  function handleSkip() {
    navigate('/home')
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <main className="bb-page">
      <section className="bb-shell max-w-2xl bb-panel">
        <button
          type="button"
          onClick={handleBack}
          className="bb-back mb-4"
        >
          Back
        </button>
        <p className="bb-label">KINFOLK PROFILE</p>
        <h1 className="bb-title mt-2 text-2xl sm:text-3xl">Set Up Your Kinfolk</h1>
        <p className="mt-2 text-sm text-mist-gray sm:text-base">
          Add the person you trust so your Signal details stay ready before you need them.
        </p>
        <p className="mt-2 text-sm text-neutral-gray/90">
          You can skip this for now and add Kinfolk later from Home.
        </p>
        {location.state?.notice ? (
          <p className="mt-3 rounded-control border border-unity-amber/45 bg-unity-amber/10 p-3 text-sm text-silver-white">
            {location.state.notice}
          </p>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <label className="block">
            <span className="mb-1 block text-sm text-silver-white">Your Name</span>
            <input
              type="text"
              value={values.yourName}
              onChange={(event) => updateField('yourName', event.target.value)}
              className="bb-input"
              aria-invalid={fieldErrors.yourName ? 'true' : 'false'}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-silver-white">Your State</span>
            <input
              type="text"
              value={values.yourState}
              onChange={(event) => updateField('yourState', event.target.value)}
              className="bb-input"
              aria-invalid={fieldErrors.yourState ? 'true' : 'false'}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-silver-white">Kinfolk Name</span>
            <input
              type="text"
              value={values.kinfolkName}
              onChange={(event) => updateField('kinfolkName', event.target.value)}
              placeholder="their name"
              className="bb-input"
              aria-invalid={fieldErrors.kinfolkName ? 'true' : 'false'}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-silver-white">Kinfolk Phone or Email</span>
            <input
              type="text"
              value={values.kinfolkContact}
              onChange={(event) => updateField('kinfolkContact', event.target.value)}
              placeholder="emergency contact phone or email"
              className="bb-input"
              aria-invalid={fieldErrors.kinfolkContact ? 'true' : 'false'}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-silver-white">Preferred Signal Message</span>
            <textarea
              value={values.preferredSignalMessage}
              onChange={(event) => updateField('preferredSignalMessage', event.target.value)}
              className="bb-textarea"
              aria-invalid={fieldErrors.preferredSignalMessage ? 'true' : 'false'}
              required
            />
          </label>

          <label className="flex items-start gap-3 rounded-control border border-divider-gray/80 bg-void-black/40 p-3">
            <input
              type="checkbox"
              checked={values.consent}
              onChange={(event) => updateField('consent', event.target.checked)}
              className="mt-1 h-4 w-4 accent-unity-amber"
            />
            <span className="text-sm leading-6 text-mist-gray">
              I understand this app is for personal documentation and education, and AI output may contain mistakes.
            </span>
          </label>

          {submitError ? <p className="text-sm text-memory-violet">{submitError}</p> : null}

          <button
            type="submit"
            disabled={!values.consent}
            className="bb-btn-primary w-full"
          >
            Save Kinfolk
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="bb-btn-ghost w-full text-neutral-gray hover:text-silver-white"
          >
            Skip for now
          </button>
        </form>
      </section>
    </main>
  )
}
