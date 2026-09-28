'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { ArrowUpRight, Loader2, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type FormValues = {
  firstName: string
  lastName: string
  email: string
  reason: string
  reasonDetails: string
  needsBusinessHelp: string
  location: string
  university: string
}

const initialValues: FormValues = {
  firstName: '',
  lastName: '',
  email: '',
  reason: '',
  reasonDetails: '',
  needsBusinessHelp: '',
  location: '',
  university: '',
}

export function RegistrationForm() {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<Partial<FormValues>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (isSubmitted) successRef.current?.focus()
  }, [isSubmitted])

  function updateField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const nextErrors: Partial<FormValues> = {}

    if (!values.firstName.trim()) nextErrors.firstName = 'First name is required.'
    if (!values.lastName.trim()) nextErrors.lastName = 'Last name is required.'
    if (!values.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!values.reason) nextErrors.reason = 'Please select a reason.'
    if (!values.needsBusinessHelp) nextErrors.needsBusinessHelp = 'Please select an option.'
    if (!values.location.trim()) nextErrors.location = 'Location is required.'
    if (!values.university.trim()) nextErrors.university = 'University is required.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) return
    setSubmitError('')
    if (!validate()) {
      requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>('input[aria-invalid="true"], [role="radio"][aria-invalid="true"]')?.focus()
      })
      toast.error('Please fix the highlighted fields.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, email: values.email.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Something went wrong. Please try again.')
      }

      setIsSubmitted(true)
      toast.success("You're registered! See you at brunch.")
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card id="register" className="registration-card bg-card">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <PartyPopper className="size-7" aria-hidden />
          </span>
          <h2 ref={successRef} tabIndex={-1} className="font-heading text-3xl text-foreground outline-none">You&apos;re on the list!</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Thanks, {values.firstName}. Your registration has been saved with{' '}
            <span className="font-medium text-foreground">{values.email.trim()}</span>.
            We look forward to seeing you on Google Meet on Friday, 31st July at 7PM WAT.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card id="register" className="registration-card bg-card">
      <CardHeader>
        <p className="eyebrow mb-2">Let&apos;s make something good</p>
        <CardTitle className="font-heading text-3xl font-normal text-foreground">
          <h3>Reserve your spot</h3>
        </CardTitle>
        <CardDescription>
          Tell us a little about yourself. All fields are required unless marked optional.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
          <fieldset disabled={isSubmitting} className="min-w-0">
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.firstName}>
                <FieldLabel htmlFor="firstName">First name</FieldLabel>
                <Input
                  id="firstName"
                  name="firstName"
                  required
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  autoComplete="given-name"
                  aria-invalid={!!errors.firstName}
                  value={values.firstName}
                  onChange={(event) => updateField('firstName', event.target.value)}
                  placeholder="Ada"
                />
                <FieldError id="firstName-error">{errors.firstName}</FieldError>
              </Field>

              <Field data-invalid={!!errors.lastName}>
                <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                <Input
                  id="lastName"
                  name="lastName"
                  required
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  autoComplete="family-name"
                  aria-invalid={!!errors.lastName}
                  value={values.lastName}
                  onChange={(event) => updateField('lastName', event.target.value)}
                  placeholder="Lovelace"
                />
                <FieldError id="lastName-error">{errors.lastName}</FieldError>
              </Field>
            </div>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                  name="email"
                  required
                  aria-describedby={errors.email ? 'email-error' : undefined}
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                value={values.email}
                onChange={(event) => updateField('email', event.target.value)}
                placeholder="ada@example.com"
              />
              <FieldError id="email-error">{errors.email}</FieldError>
            </Field>

            <FieldSet data-invalid={!!errors.reason}>
              <FieldLegend variant="label">Reason for learning</FieldLegend>
              <FieldDescription>Tell us why you&apos;re joining the session.</FieldDescription>
              <RadioGroup
                aria-label="Reason for learning"
                aria-required="true"
                aria-describedby={errors.reason ? 'reason-error' : undefined}
                value={values.reason}
                onValueChange={(value) => updateField('reason', String(value))}
                aria-invalid={!!errors.reason}
                className="grid gap-2 sm:grid-cols-2"
              >
                <FieldLabel htmlFor="reason-fun">
                  <Field orientation="horizontal">
                    <RadioGroupItem value="For fun" id="reason-fun" aria-invalid={!!errors.reason} />
                    For fun
                  </Field>
                </FieldLabel>
                <FieldLabel htmlFor="reason-business">
                  <Field orientation="horizontal">
                    <RadioGroupItem value="For business" id="reason-business" aria-invalid={!!errors.reason} />
                    For business
                  </Field>
                </FieldLabel>
              </RadioGroup>
              <FieldError id="reason-error">{errors.reason}</FieldError>
              {values.reason ? (
                <Field>
                  <FieldLabel htmlFor="reasonDetails">Tell us a bit more (optional)</FieldLabel>
                  <Textarea
                    id="reasonDetails"
                    value={values.reasonDetails}
                    onChange={(event) => updateField('reasonDetails', event.target.value)}
                    placeholder={
                      values.reason === 'For fun'
                        ? 'e.g. I love brunch and want to try new recipes at home.'
                        : 'e.g. I want to start a weekend snack business and need a solid recipe.'
                    }
                    rows={3}
                  />
                </Field>
              ) : null}
            </FieldSet>

            <FieldSet data-invalid={!!errors.needsBusinessHelp}>
              <FieldLegend variant="label">Business support after learning</FieldLegend>
              <FieldDescription>Do you need help establishing your business after learning?</FieldDescription>
              <RadioGroup
                aria-label="Business support after learning"
                aria-required="true"
                aria-describedby={errors.needsBusinessHelp ? 'needsBusinessHelp-error' : undefined}
                value={values.needsBusinessHelp}
                onValueChange={(value) => updateField('needsBusinessHelp', String(value))}
                aria-invalid={!!errors.needsBusinessHelp}
                className="grid gap-2 sm:grid-cols-2"
              >
                <FieldLabel htmlFor="help-yes">
                  <Field orientation="horizontal">
                    <RadioGroupItem value="Yes" id="help-yes" aria-invalid={!!errors.needsBusinessHelp} />
                    Yes
                  </Field>
                </FieldLabel>
                <FieldLabel htmlFor="help-no">
                  <Field orientation="horizontal">
                    <RadioGroupItem value="No" id="help-no" aria-invalid={!!errors.needsBusinessHelp} />
                    No
                  </Field>
                </FieldLabel>
              </RadioGroup>
              <FieldError id="needsBusinessHelp-error">{errors.needsBusinessHelp}</FieldError>
            </FieldSet>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.location}>
                <FieldLabel htmlFor="location">Location</FieldLabel>
                <Input
                  id="location"
                  name="location"
                  required
                  aria-describedby={errors.location ? 'location-error' : undefined}
                  autoComplete="address-level2"
                  aria-invalid={!!errors.location}
                  value={values.location}
                  onChange={(event) => updateField('location', event.target.value)}
                  placeholder="Lagos, Nigeria"
                />
                <FieldError id="location-error">{errors.location}</FieldError>
              </Field>

              <Field data-invalid={!!errors.university}>
                <FieldLabel htmlFor="university">University</FieldLabel>
                <Input
                  id="university"
                  name="university"
                  required
                  aria-describedby={errors.university ? 'university-error' : undefined}
                  autoComplete="organization"
                  aria-invalid={!!errors.university}
                  value={values.university}
                  onChange={(event) => updateField('university', event.target.value)}
                  placeholder="University of Lagos, or N/A"
                />
                <FieldError id="university-error">{errors.university}</FieldError>
              </Field>
            </div>

            {submitError && <p role="alert" className="rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">{submitError} Your details are still here; please try again.</p>}
            <Button type="submit" size="lg" disabled={isSubmitting} className="h-12 w-full justify-between px-5 font-semibold hover:bg-primary/90">
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                  Submitting...
                </>
              ) : (
                <>Reserve my spot <ArrowUpRight size={18} aria-hidden /></>
              )}
            </Button>
          </FieldGroup>
          </fieldset>
          <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">Friday, 31st July &middot; 7PM WAT &middot; Google Meet</p>
        </form>
      </CardContent>
    </Card>
  )
}
