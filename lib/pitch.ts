export const pitchStages = ['Idea / pre-revenue', 'Operating business'] as const
export const reviewStatuses = ['New', 'Reviewing', 'Shortlisted', 'Not selected'] as const
export type ReviewStatus = typeof reviewStatuses[number]
export const maxDeckBytes = 4 * 1024 * 1024

export const pitchFields = {
  founderName: { label: 'Your full name', limit: 150 },
  email: { label: 'Email', limit: 254 },
  phone: { label: 'Phone number (optional)', limit: 50, optional: true },
  businessName: { label: 'Business or idea name', limit: 150 },
  sector: { label: 'Industry / sector', limit: 150 },
  stage: { label: 'Business stage', limit: 50 },
  location: { label: 'Business location', limit: 200 },
  summary: { label: 'What does your business do?', limit: 2000 },
  customers: { label: 'Who are your customers?', limit: 1500 },
  revenueModel: { label: 'How will the business generate cash flow?', limit: 2000 },
  turnover: { label: 'Current sales / turnover', limit: 1500 },
  launchPlan: { label: 'Your plan to reach first sales', limit: 1500 },
  supportNeeded: { label: 'What support are you seeking?', limit: 1500 },
} as const

export type PitchField = keyof typeof pitchFields
export type PitchValues = Record<PitchField, string>
export type PitchErrors = Partial<Record<PitchField | 'deck', string>>
export type PitchRecord = PitchValues & {
  id: string
  submittedAt: string
  deckPath: string
  deckName: string
  status: ReviewStatus
  notes: string
  reviewedAt: string
}

export function validatePitch(input: unknown): { values: PitchValues; errors: PitchErrors } {
  const body = input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {}
  const values = {} as PitchValues
  const errors: PitchErrors = {}
  for (const key of Object.keys(pitchFields) as PitchField[]) {
    const field = pitchFields[key]
    const raw = body[key]
    const relevant = key === 'turnover' ? body.stage === 'Operating business'
      : key === 'launchPlan' ? body.stage === 'Idea / pre-revenue' : true
    values[key] = relevant && typeof raw === 'string' ? raw.trim() : ''
    if (!relevant) continue
    if (raw !== undefined && typeof raw !== 'string') errors[key] = 'Please enter text.'
    else if (!values[key] && !('optional' in field)) errors[key] = 'Please complete this field.'
    else if (values[key].length > field.limit) errors[key] = `Use no more than ${field.limit} characters.`
  }
  values.email = values.email.toLowerCase()
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address.'
  if (!pitchStages.some(stage => stage === values.stage)) errors.stage = 'Choose your business stage.'
  return { values, errors }
}

export function validateDeck(name: string, size: number, signature?: Uint8Array) {
  if (!/\.pdf$/i.test(name)) return 'Upload your pitch deck as a PDF.'
  if (size === 0 || size > maxDeckBytes) return 'Choose a PDF up to 4 MB.'
  if (signature && new TextDecoder().decode(signature.slice(0, 5)) !== '%PDF-') return 'This file is not a valid PDF.'
  return null
}

export type IntakeState = { open: boolean; available: boolean }
