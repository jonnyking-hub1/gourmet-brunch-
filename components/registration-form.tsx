'use client'

import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Loader2, PartyPopper } from 'lucide-react'
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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
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

    if (!validate()) {
      toast.error('Please fix the highlighted fields.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Something went wrong. Please try again.')
      }

      setIsSubmitted(true)
      toast.success("You're registered! See you at brunch.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card id="register" className="border-border/80 bg-card shadow-lg">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <PartyPopper className="size-7" aria-hidden />
          </span>
          <h2 className="font-heading text-xl font-bold text-foreground">You&apos;re on the list!</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Thanks, {values.firstName}. A Google Meet link and reminder will be sent to{' '}
            <span className="font-medium text-foreground">{values.email}</span> ahead of Friday, 31st July at 7PM
            WAT.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card id="register" className="border-border/80 bg-card shadow-lg">
      <CardHeader>
        <CardTitle className="font-heading text-xl font-bold text-foreground sm:text-2xl">
          Reserve your spot
        </CardTitle>
        <CardDescription>
          Fill in your details below and we&apos;ll save your seat for the live session on Google Meet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.firstName}>
                <FieldLabel htmlFor="firstName">First name</FieldLabel>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  aria-invalid={!!errors.firstName}
                  value={values.firstName}
                  onChange={(event) => updateField('firstName', event.target.value)}
                  placeholder="Ada"
                />
                <FieldError>{errors.firstName}</FieldError>
              </Field>

              <Field data-invalid={!!errors.lastName}>
                <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  aria-invalid={!!errors.lastName}
                  value={values.lastName}
                  onChange={(event) => updateField('lastName', event.target.value)}
                  placeholder="Lovelace"
                />
                <FieldError>{errors.lastName}</FieldError>
              </Field>
            </div>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                value={values.email}
                onChange={(event) => updateField('email', event.target.value)}
                placeholder="ada@example.com"
              />
              <FieldError>{errors.email}</FieldError>
            </Field>

            <FieldSet data-invalid={!!errors.reason}>
              <FieldLegend variant="label">Reason for learning</FieldLegend>
              <FieldDescription>Tell us why you&apos;re joining the session.</FieldDescription>
              <RadioGroup
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
              <FieldError>{errors.reason}</FieldError>
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
              <FieldError>{errors.needsBusinessHelp}</FieldError>
            </FieldSet>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.location}>
                <FieldLabel htmlFor="location">Location</FieldLabel>
                <Input
                  id="location"
                  autoComplete="address-level2"
                  aria-invalid={!!errors.location}
                  value={values.location}
                  onChange={(event) => updateField('location', event.target.value)}
                  placeholder="Lagos, Nigeria"
                />
                <FieldError>{errors.location}</FieldError>
              </Field>

              <Field data-invalid={!!errors.university}>
                <FieldLabel htmlFor="university">University</FieldLabel>
                <Input
                  id="university"
                  autoComplete="organization"
                  aria-invalid={!!errors.university}
                  value={values.university}
                  onChange={(event) => updateField('university', event.target.value)}
                  placeholder="University of Lagos"
                />
                <FieldError>{errors.university}</FieldError>
              </Field>
            </div>

            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full font-semibold">
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                  Submitting...
                </>
              ) : (
                'Register for the session'
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
