'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowUpRight, CheckCircle2, FileUp, Loader2 } from 'lucide-react'
import { pitchFields, pitchStages, validateDeck, validatePitch, type PitchErrors, type PitchField } from '@/lib/pitch'
import { useIntake } from './use-intake'

const longFields = new Set<PitchField>(['summary', 'customers', 'revenueModel', 'turnover', 'launchPlan', 'supportNeeded'])

export function PitchForm() {
  const { intake, refresh } = useIntake()
  const [started, setStarted] = useState(false)
  const [stage, setStage] = useState('')
  const [errors, setErrors] = useState<PitchErrors>({})
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [reference, setReference] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => { if (intake?.open) setStarted(true) }, [intake?.open])
  useEffect(() => { if (reference) successRef.current?.focus() }, [reference])

  function focusError() {
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setMessage('')
    const form = new FormData(event.currentTarget)
    const result = validatePitch(Object.fromEntries(form.entries()))
    const file = form.get('deck')
    const issue = file instanceof File ? validateDeck(file.name, file.size) : 'Attach your PDF pitch deck.'
    if (issue) result.errors.deck = issue
    setErrors(result.errors)
    if (Object.keys(result.errors).length) { focusError(); return }
    setPending(true)
    try {
      const response = await fetch('/api/pitches', { method: 'POST', body: form })
      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.success) {
        if (data?.errors) { setErrors(data.errors); focusError() }
        if (response.status === 409) void refresh()
        throw new Error(data?.error || 'We could not submit your pitch. Please try again.')
      }
      setReference(data.id)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'We could not submit your pitch. Please try again.')
    } finally { setPending(false) }
  }

  if (reference) return (
    <section className="portal-card pitch-success">
      <CheckCircle2 size={40} aria-hidden />
      <p className="eyebrow">Submission received</p>
      <h2 ref={successRef} tabIndex={-1}>Your next chapter<br /><em>starts here.</em></h2>
      <p>Your business details and pitch deck have been saved for the organising team to review.</p>
      <p className="reference-label">Your reference <strong>{reference}</strong></p>
      <p>Submission does not guarantee selection or funding. Please keep your reference for any follow-up.</p>
      <a className="text-link" href="/">Return to the programme</a>
    </section>
  )

  if (!started && !intake?.open) return (
    <section className="portal-card intake-empty" aria-live="polite">
      <FileUp size={35} aria-hidden />
      <p className="eyebrow">Venture submissions</p>
      <h2>{intake === null ? 'Checking availability…' : 'Get your pitch ready.'}</h2>
      <p>{intake === null ? 'One moment while we check submissions.' : intake.available ? 'Pitch submissions are currently closed. Check back here when the next intake opens.' : 'Pitch submissions are not available at the moment. Please check back shortly.'}</p>
      <p>Ideas and operating businesses from every sector are welcome when submissions open.</p>
      <button className="outline-action" type="button" onClick={() => void refresh()}>Check availability</button>
    </section>
  )

  return (
    <section className="portal-card">
      <p className="eyebrow">Your venture, your story</p>
      <h2 className="form-title">Submit your pitch</h2>
      <p className="form-intro">All fields are required unless marked optional.</p>
      {!intake?.open && <p className="form-notice" role="status">Submissions are currently unavailable. Your draft is still here. <button type="button" className="text-link" onClick={() => void refresh()}>Check again</button></p>}
      <form ref={formRef} onSubmit={submit} noValidate aria-busy={pending} className="portal-form">
        <fieldset disabled={pending}>
          <div hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          {(Object.keys(pitchFields) as PitchField[]).map(key => {
            if (key === 'turnover' && stage !== 'Operating business') return null
            if (key === 'launchPlan' && stage !== 'Idea / pre-revenue') return null
            const field = pitchFields[key]
            const shared = {
              id: key, name: key, required: !('optional' in field),
              'aria-invalid': !!errors[key], 'aria-describedby': errors[key] ? `${key}-error` : ['turnover', 'launchPlan', 'revenueModel'].includes(key) ? `${key}-hint` : undefined,
              onChange: () => setErrors(previous => ({ ...previous, [key]: undefined })),
            }
            return (
              <div className="portal-field" key={key}>
                <label htmlFor={key}>{field.label}</label>
                {key === 'stage' ? (
                  <select {...shared} value={stage} onChange={event => { setStage(event.target.value); setErrors(previous => ({ ...previous, stage: undefined })) }}>
                    <option value="">Choose a stage</option>{pitchStages.map(value => <option key={value}>{value}</option>)}
                  </select>
                ) : longFields.has(key) ? <textarea {...shared} maxLength={field.limit} rows={3} /> : (
                  <input {...shared} maxLength={field.limit} type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'} autoComplete={key === 'email' ? 'email' : key === 'founderName' ? 'name' : key === 'phone' ? 'tel' : 'off'} placeholder={key === 'sector' ? 'e.g. Retail, logistics, services, food & beverage' : undefined} />
                )}
                {key === 'turnover' && <p id={`${key}-hint`}>Include the currency, time period, and whether sales are recurring.</p>}
                {key === 'launchPlan' && <p id={`${key}-hint`}>Explain how you will launch, reach customers, and make your first sales.</p>}
                {key === 'revenueModel' && <p id={`${key}-hint`}>Tell us what customers pay for, how often, and the main costs of delivering it.</p>}
                {errors[key] && <p id={`${key}-error`} className="field-error">{errors[key]}</p>}
              </div>
            )
          })}
          <div className="portal-field deck-upload">
            <label htmlFor="deck"><FileUp size={19} aria-hidden /> Pitch deck</label>
            <input id="deck" name="deck" type="file" accept=".pdf,application/pdf" required aria-invalid={!!errors.deck} aria-describedby={errors.deck ? 'deck-error' : 'deck-hint'} onChange={() => setErrors(previous => ({ ...previous, deck: undefined }))} />
            <p id="deck-hint">PDF only, up to 4 MB. Your deck is shared privately with the organising team.</p>
            {errors.deck && <p id="deck-error" className="field-error">{errors.deck}</p>}
          </div>
          <p className="registration-disclosure">By submitting, you are sharing these details and your deck with the organisers for review. Funding and support are subject to final selection and the investment structure.</p>
          {message && <p className="form-error" role="alert">{message}</p>}
          <button type="submit" className="primary-link" disabled={pending || !intake?.open}>
            {pending ? <><Loader2 className="animate-spin" size={18} aria-hidden /> Submitting your pitch…</> : <>Submit for consideration <ArrowUpRight size={18} aria-hidden /></>}
          </button>
        </fieldset>
      </form>
    </section>
  )
}
