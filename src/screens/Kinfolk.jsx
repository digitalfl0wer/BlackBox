import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CONTACTS_KEY = 'blackbox_kinfolk_contacts'
const PRIMARY_KEY = 'blackbox_kinfolk'

const INITIAL_FORM = {
  yourName: '',
  yourState: '',
  kinfolkName: '',
  kinfolkContact: '',
  preferredSignalMessage: 'Hi, this is a Black Boxx Signal. Please check on me when you can.',
}

function readContacts() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CONTACTS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeContacts(contacts) {
  window.localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts))
}

function syncPrimaryContact(contacts) {
  const primary = contacts.find((contact) => contact.isPrimary) || contacts[0]
  if (!primary) {
    window.localStorage.removeItem(PRIMARY_KEY)
    return
  }
  window.localStorage.setItem(
    PRIMARY_KEY,
    JSON.stringify({
      yourName: primary.yourName,
      yourState: primary.yourState,
      kinfolkName: primary.kinfolkName,
      kinfolkContact: primary.kinfolkContact,
      preferredSignalMessage: primary.preferredSignalMessage,
      consent: true,
      savedAt: new Date().toISOString(),
    })
  )
}

export default function Kinfolk({ setupMode = false }) {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loaded = readContacts()
    setContacts(loaded)
    setShowForm(loaded.length === 0)
  }, [])

  const isFormValid = useMemo(
    () => form.kinfolkName.trim() && form.kinfolkContact.trim(),
    [form.kinfolkContact, form.kinfolkName]
  )

  function saveAndSync(nextContacts) {
    setContacts(nextContacts)
    writeContacts(nextContacts)
    syncPrimaryContact(nextContacts)
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!isFormValid) {
      setError('Kinfolk name and contact are required.')
      return
    }
    const isFirstSetupContact = setupMode && !editingId && contacts.length === 0

    const nextContact = {
      id: editingId || `${Date.now()}`,
      yourName: form.yourName.trim(),
      yourState: form.yourState.trim(),
      kinfolkName: form.kinfolkName.trim(),
      kinfolkContact: form.kinfolkContact.trim(),
      preferredSignalMessage: form.preferredSignalMessage.trim(),
      isPrimary: editingId ? contacts.find((contact) => contact.id === editingId)?.isPrimary : contacts.length === 0,
    }

    const nextContacts = editingId
      ? contacts.map((contact) => (contact.id === editingId ? nextContact : contact))
      : [nextContact, ...contacts]

    saveAndSync(nextContacts)
    setForm(INITIAL_FORM)
    setEditingId(null)
    setShowForm(false)
    setError('')

    if (isFirstSetupContact) {
      navigate('/home', { replace: true })
    }
  }

  function handleRemove(contactId) {
    const nextContacts = contacts.filter((contact) => contact.id !== contactId)
    if (nextContacts.length > 0 && !nextContacts.some((contact) => contact.isPrimary)) {
      nextContacts[0].isPrimary = true
    }
    saveAndSync(nextContacts)
    if (editingId === contactId) {
      setEditingId(null)
      setForm(INITIAL_FORM)
    }
  }

  function handleSetPrimary(contactId) {
    const nextContacts = contacts.map((contact) => ({
      ...contact,
      isPrimary: contact.id === contactId,
    }))
    saveAndSync(nextContacts)
  }

  function handleEdit(contact) {
    setForm({
      yourName: contact.yourName || '',
      yourState: contact.yourState || '',
      kinfolkName: contact.kinfolkName || '',
      kinfolkContact: contact.kinfolkContact || '',
      preferredSignalMessage:
        contact.preferredSignalMessage || 'Hi, this is a Black Boxx Signal. Please check on me, I am feeling unsafe',
    })
    setEditingId(contact.id)
    setShowForm(true)
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    if (setupMode) {
      navigate('/', { replace: true })
      return
    }
    navigate('/home', { replace: true })
  }

  return (
    <main className="bbx-page">
      <section className="bbx-shell max-w-4xl">
        <div className="bbx-card p-6 sm:p-8">
          <button type="button" onClick={handleBack} className="bbx-back">
            ← Back
          </button>
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-[#9090A8]">KINFOLK</p>
          <h1 className="bbx-font-display mt-2 text-4xl">Your Trusted Circle</h1>

          {!showForm && contacts.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-white/25 bg-[#11111c] p-8 text-center">
              <p className="text-3xl">◎</p>
              <p className="mt-3 text-lg text-white">No contacts yet</p>
              <p className="mt-1 text-sm text-[#9E9EB6]">
                Add someone you trust so your signal can reach support instantly.
              </p>
              <button type="button" onClick={() => setShowForm(true)} className="bbx-action bbx-action-amber mt-5 px-5">
                Add Your First Kinfolk
              </button>
            </div>
          ) : null}

          {contacts.length > 0 ? (
            <div className="mt-6 space-y-3">
              {contacts.map((contact) => (
                <article key={contact.id} className="rounded-2xl border border-white/10 bg-[#141422] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7B4FFF]/35 font-semibold">
                        {(contact.kinfolkName || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{contact.kinfolkName}</p>
                        {contact.isPrimary ? (
                          <span className="mt-1 inline-flex rounded-full border border-[#F5A623]/45 bg-[#2a2010] px-2 py-0.5 text-xs text-[#F5A623]">
                            Primary
                          </span>
                        ) : null}
                        <p className="mt-2 text-sm text-[#B5B5CB]">{contact.kinfolkContact}</p>
                        <p className="mt-2 text-xs text-[#8E8EA5]">{contact.preferredSignalMessage}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleEdit(contact)} className="bbx-action bbx-action-gray h-9 px-3 text-sm">✎</button>
                      {!contact.isPrimary ? (
                        <button type="button" onClick={() => handleSetPrimary(contact.id)} className="bbx-action bbx-action-gray h-9 px-3 text-sm">★</button>
                      ) : null}
                      <button type="button" onClick={() => handleRemove(contact.id)} className="bbx-action h-9 bg-[#331a20] px-3 text-sm text-[#ffb2bc]">✕</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {!showForm && contacts.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-4 w-full rounded-xl border border-dashed border-white/28 bg-[#11111a] px-4 py-3 text-sm text-[#C3C3D5]"
            >
              Add another Kinfolk
            </button>
          ) : null}

          {showForm ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-[#10101A] p-4 sm:p-5">
              <p className="bbx-font-display text-2xl">{editingId ? 'Edit Kinfolk' : 'Add Kinfolk'}</p>
              <input
                value={form.yourName}
                onChange={(event) => setForm((prev) => ({ ...prev, yourName: event.target.value }))}
                placeholder="Your Name"
                className="h-11 w-full rounded-xl border border-white/14 bg-[#191928] px-3 text-white"
              />
              <input
                value={form.yourState}
                onChange={(event) => setForm((prev) => ({ ...prev, yourState: event.target.value }))}
                placeholder="State"
                className="h-11 w-full rounded-xl border border-white/14 bg-[#191928] px-3 text-white"
              />
              <input
                value={form.kinfolkName}
                onChange={(event) => setForm((prev) => ({ ...prev, kinfolkName: event.target.value }))}
                placeholder="Kinfolk Name *"
                required
                className="h-11 w-full rounded-xl border border-white/14 bg-[#191928] px-3 text-white"
              />
              <input
                value={form.kinfolkContact}
                onChange={(event) => setForm((prev) => ({ ...prev, kinfolkContact: event.target.value }))}
                placeholder="Phone or Email *"
                required
                className="h-11 w-full rounded-xl border border-white/14 bg-[#191928] px-3 text-white"
              />
              <textarea
                value={form.preferredSignalMessage}
                onChange={(event) => setForm((prev) => ({ ...prev, preferredSignalMessage: event.target.value }))}
                className="min-h-[88px] w-full rounded-xl border border-white/14 bg-[#191928] p-3 text-white"
              />
              {error ? <p className="text-sm text-[#ffacb7]">{error}</p> : null}
              <div className="flex gap-2">
                <button type="submit" className="bbx-action bbx-action-amber flex-1">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setForm(INITIAL_FORM)
                  }}
                  className="bbx-action bbx-action-gray flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </section>
    </main>
  )
}
