export const businessStages = [
  'Exploring an idea',
  'Developing a product',
  'Running a business',
] as const

export const registrationGoals = [
  'Start an F&B business',
  'Grow an F&B business',
] as const

export type RegistrationValues = {
  firstName: string
  lastName: string
  email: string
  businessStage: string
  reason: string
  reasonDetails: string
  needsBusinessHelp: string
  location: string
  university: string
}

export type RegistrationErrors = Partial<Record<keyof RegistrationValues, string>>

// Shared by the browser and API so required fields and accepted choices agree.
export function validateRegistration(input: unknown): {
  values: RegistrationValues
  errors: RegistrationErrors
} {
  const body: Record<string, unknown> = input && typeof input === 'object' && !Array.isArray(input)
    ? input as Record<string, unknown>
    : {}
  const errors: RegistrationErrors = {}

  function read(key: keyof RegistrationValues, label: string, limit: number, required = true) {
    const raw = body[key]
    if (raw !== undefined && typeof raw !== 'string') {
      errors[key] = `${label} must be text.`
      return ''
    }
    const value = typeof raw === 'string' ? raw.trim() : ''
    if (required && !value) errors[key] = `${label} is required.`
    else if (value.length > limit) errors[key] = `Keep ${label.toLowerCase()} under ${limit + 1} characters.`
    return value
  }

  const values: RegistrationValues = {
    firstName: read('firstName', 'First name', 100),
    lastName: read('lastName', 'Last name', 100),
    email: read('email', 'Email', 254).toLowerCase(),
    businessStage: read('businessStage', 'Business stage', 100),
    reason: read('reason', 'Programme goal', 100),
    reasonDetails: read('reasonDetails', 'Business idea or product', 1500, false),
    needsBusinessHelp: read('needsBusinessHelp', 'Business support preference', 20),
    location: read('location', 'Location', 200),
    university: read('university', 'University', 200, false),
  }

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!errors.businessStage && !businessStages.some(stage => stage === values.businessStage)) {
    errors.businessStage = 'Please select your business stage.'
  }
  if (!errors.reason && !registrationGoals.some(goal => goal === values.reason)) {
    errors.reason = 'Please select your programme goal.'
  }
  if (!errors.needsBusinessHelp && !['Yes', 'No'].includes(values.needsBusinessHelp)) {
    errors.needsBusinessHelp = 'Please select an option.'
  }

  return { values, errors }
}

export function registrationRow(values: RegistrationValues, timestamp: string) {
  // Preserve the original A:I column order; business stage is appended in J.
  return [
    timestamp, values.firstName, values.lastName, values.email,
    values.reason, values.reasonDetails, values.needsBusinessHelp,
    values.location, values.university, values.businessStage,
  ]
}
