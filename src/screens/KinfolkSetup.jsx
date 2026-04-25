import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <main className="min-h-screen bg-void-black px-4 py-8 text-silver-white sm:px-6">
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-neutral-gray/30 bg-slate-black p-5 sm:p-7">
        <button
          type="button"
          onClick={handleBack}
          className="h-8 -translate-y-3 self-start rounded-md border border-neutral-gray/40 bg-void-black px-2 py-0.5 text-[10px] font-medium text-silver-white"
        >
          Back
        </button>
        <h1 className="text-2xl font-semibold text-silver-white sm:text-3xl">Set Up Your Kinfolk</h1>
        <p className="mt-2 text-sm text-neutral-gray sm:text-base">
          Add the person you trust so your Signal details stay ready before you need them.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <label className="block">
            <span className="mb-1 block text-sm text-silver-white">Your Name</span>
            <input
              type="text"
              value={values.yourName}
              onChange={(event) => updateField('yourName', event.target.value)}
              className="min-h-12 w-full rounded-lg border border-neutral-gray/40 bg-void-black px-3 text-silver-white outline-none focus:border-unity-amber"
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
              className="min-h-12 w-full rounded-lg border border-neutral-gray/40 bg-void-black px-3 text-silver-white outline-none focus:border-unity-amber"
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
              placeholder="emergency contact"
              className="min-h-12 w-full rounded-lg border border-neutral-gray/40 bg-void-black px-3 text-silver-white outline-none focus:border-unity-amber"
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
              className="min-h-12 w-full rounded-lg border border-neutral-gray/40 bg-void-black px-3 text-silver-white outline-none focus:border-unity-amber"
              aria-invalid={fieldErrors.kinfolkContact ? 'true' : 'false'}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-silver-white">Preferred Signal Message</span>
            <textarea
              value={values.preferredSignalMessage}
              onChange={(event) => updateField('preferredSignalMessage', event.target.value)}
              className="min-h-24 w-full rounded-lg border border-neutral-gray/40 bg-void-black px-3 py-2 text-silver-white outline-none focus:border-unity-amber"
              aria-invalid={fieldErrors.preferredSignalMessage ? 'true' : 'false'}
              required
            />
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-neutral-gray/30 bg-void-black/40 p-3">
            <input
              type="checkbox"
              checked={values.consent}
              onChange={(event) => updateField('consent', event.target.checked)}
              className="mt-1 h-4 w-4 accent-unity-amber"
            />
            <span className="text-sm leading-6 text-neutral-gray">
              I understand this app is for personal documentation and education, and AI output may contain mistakes.
            </span>
          </label>

          {submitError ? <p className="text-sm text-memory-violet">{submitError}</p> : null}

          <button
            type="submit"
            disabled={!values.consent}
            className="min-h-12 w-full rounded-lg bg-unity-amber px-4 py-3 text-sm font-semibold text-void-black transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save Kinfolk
          </button>
        </form>
      </section>
    </main>
  )
}
