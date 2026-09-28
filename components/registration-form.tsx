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
import { event as programme, selectionNote } from '@/lib/event'
import { businessStages, registrationGoals, validateRegistration, type RegistrationValues, type RegistrationErrors } from '@/lib/registration'

const initialValues: RegistrationValues = {
  firstName: '',
  lastName: '',
  email: '',
  businessStage: '',
  reason: '',
  reasonDetails: '',
  needsBusinessHelp: '',
  location: '',
  university: '',
}

export function RegistrationForm() {
  const [values, setValues] = useState<RegistrationValues>(initialValues)
  const [errors, setErrors] = useState<RegistrationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (isSubmitted) successRef.current?.focus()
  }, [isSubmitted])

  function updateField<K extends keyof RegistrationValues>(key: K, value: RegistrationValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function focusFirstError() {
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>('input[aria-invalid="true"], textarea[aria-invalid="true"], [role="radio"][aria-invalid="true"]')?.focus()
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) return
    setSubmitError('')
    const validated = validateRegistration(values)
    setErrors(validated.errors)
    if (Object.keys(validated.errors).length) {
      focusFirstError()
      toast.error('Please fix the highlighted fields.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated.values),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        if (data?.errors) {
          setErrors(data.errors)
          focusFirstError()
        }
        throw new Error(data?.error || 'Something went wrong. Please try again.')
      }

      setValues(validated.values)
      setIsSubmitted(true)
      toast.success("You're registered for EEA Cohort 01!")
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
          <h3 ref={successRef} tabIndex={-1} className="font-heading text-3xl text-foreground outline-none">You&apos;re registered for Cohort 01!</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Thanks, {values.firstName}. Your {programme.edition} programme registration has been saved with{' '}
            <span className="font-medium text-foreground">{values.email.trim()}</span>.
            {' '}Join us on {programme.venue}, {programme.date} at {programme.time}.
          </p>
          <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">This confirms programme registration. Venture selection is separate. {selectionNote}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card id="register" className="registration-card bg-card">
      <CardHeader>
        <p className="eyebrow mb-2">{programme.edition} · {programme.cohort}</p>
        <CardTitle className="font-heading text-3xl font-normal text-foreground">
          <h3>Join the programme</h3>
        </CardTitle>
        <CardDescription>
          Tell us about yourself and what you&apos;re building. All fields are required unless marked optional.
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

              <FieldSet data-invalid={!!errors.businessStage}>
                <FieldLegend variant="label">Where are you in your business journey?</FieldLegend>
                <RadioGroup
                  aria-label="Business stage"
                  aria-required="true"
                  aria-describedby={errors.businessStage ? 'businessStage-error' : undefined}
                  value={values.businessStage}
                  onValueChange={(value) => updateField('businessStage', String(value))}
                  aria-invalid={!!errors.businessStage}
                  className="grid gap-2"
                >
                  {businessStages.map((stage, index) => (
                    <FieldLabel key={stage} htmlFor={`stage-${index}`}>
                      <Field orientation="horizontal">
                        <RadioGroupItem value={stage} id={`stage-${index}`} aria-invalid={!!errors.businessStage} />
                        {stage}
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
                <FieldError id="businessStage-error">{errors.businessStage}</FieldError>
              </FieldSet>

              <FieldSet data-invalid={!!errors.reason}>
                <FieldLegend variant="label">What is your main goal?</FieldLegend>
                <FieldDescription>Tell us what you want to work towards through the programme.</FieldDescription>
                <RadioGroup
                  aria-label="Programme goal"
                  aria-required="true"
                  aria-describedby={errors.reason ? 'reason-error' : undefined}
                  value={values.reason}
                  onValueChange={(value) => updateField('reason', String(value))}
                  aria-invalid={!!errors.reason}
                  className="grid gap-2 sm:grid-cols-2"
                >
                  {registrationGoals.map((goal, index) => (
                    <FieldLabel key={goal} htmlFor={`goal-${index}`}>
                      <Field orientation="horizontal">
                        <RadioGroupItem value={goal} id={`goal-${index}`} aria-invalid={!!errors.reason} />
                        {goal}
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
                <FieldError id="reason-error">{errors.reason}</FieldError>
              </FieldSet>
              <Field data-invalid={!!errors.reasonDetails}>
                <FieldLabel htmlFor="reasonDetails">Your business idea or product (optional)</FieldLabel>
                <FieldDescription id="idea-description">A short introduction helps us understand your interests. This is not a funding application.</FieldDescription>
                <Textarea
                  id="reasonDetails"
                  name="reasonDetails"
                  maxLength={1500}
                  aria-invalid={!!errors.reasonDetails}
                  aria-describedby={`idea-description${errors.reasonDetails ? ' reasonDetails-error' : ''}`}
                  value={values.reasonDetails}
                  onChange={(event) => updateField('reasonDetails', event.target.value)}
                  placeholder="e.g. I’m developing an affordable lunch service for students and want to understand pricing and packaging."
                  rows={3}
                />
                <FieldError id="reasonDetails-error">{errors.reasonDetails}</FieldError>
              </Field>

              <FieldSet data-invalid={!!errors.needsBusinessHelp}>
                <FieldLegend variant="label">Would you like business support?</FieldLegend>
                <FieldDescription>Tell us if you&apos;re interested in support to establish or grow your business.</FieldDescription>
                <RadioGroup
                  aria-label="Business support interest"
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
                  <FieldLabel htmlFor="university">University (optional)</FieldLabel>
                  <Input
                    id="university"
                    name="university"
                    aria-describedby={errors.university ? 'university-error' : undefined}
                    autoComplete="organization"
                    aria-invalid={!!errors.university}
                    value={values.university}
                    onChange={(event) => updateField('university', event.target.value)}
                    placeholder="If applicable"
                  />
                  <FieldError id="university-error">{errors.university}</FieldError>
                </Field>
              </div>

              <p className="registration-disclosure">You&apos;re registering to attend EEA. This form is not a funding application. {selectionNote}</p>
              {submitError && <p role="alert" className="rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">{submitError} Your details are still here; please try again.</p>}
              <Button type="submit" size="lg" disabled={isSubmitting} className="h-12 w-full justify-between px-5 font-semibold hover:bg-primary/90">
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                    Submitting...
                  </>
                ) : (
                  <>Register for Cohort 01 <ArrowUpRight size={18} aria-hidden /></>
                )}
              </Button>
            </FieldGroup>
          </fieldset>
          <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">{programme.date} &middot; {programme.time} &middot; {programme.venue}</p>
        </form>
      </CardContent>
    </Card>
  )
}
