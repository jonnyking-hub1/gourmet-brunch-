import assert from 'node:assert/strict'
import test from 'node:test'
import { registrationRow, validateRegistration } from '../lib/registration.ts'

const registration = {
  firstName: ' Ada ',
  lastName: ' Okafor ',
  email: ' ADA@EXAMPLE.COM ',
  businessStage: 'Developing a product',
  reason: 'Start an F&B business',
  reasonDetails: ' An affordable lunch service. ',
  needsBusinessHelp: 'Yes',
  location: ' Lagos ',
}

test('non-students can register without a university; text and email are normalized', () => {
  const { values, errors } = validateRegistration(registration)
  assert.deepEqual(errors, {})
  assert.equal(values.university, '')
  assert.equal(values.firstName, 'Ada')
  assert.equal(values.email, 'ada@example.com')
  assert.equal(values.reasonDetails, 'An affordable lunch service.')
})

test('business stage is required and choices are validated on the server', () => {
  for (const stage of [undefined, '', 'Unknown']) {
    assert.ok(validateRegistration({ ...registration, businessStage: stage }).errors.businessStage)
  }
  assert.ok(validateRegistration({ ...registration, reason: 'For fun' }).errors.reason)
  assert.ok(validateRegistration({ ...registration, needsBusinessHelp: 'Maybe' }).errors.needsBusinessHelp)
})

test('a business idea is optional for programme registration', () => {
  const { errors, values } = validateRegistration({ ...registration, reasonDetails: undefined })
  assert.deepEqual(errors, {})
  assert.equal(values.reasonDetails, '')
})

test('malformed payloads and field types yield errors instead of crashing', () => {
  for (const body of [null, [], 42, 'text', { ...registration, firstName: 42 }, { ...registration, university: {} }]) {
    assert.ok(Object.keys(validateRegistration(body).errors).length)
  }
})

test('invalid email and overly long idea descriptions are rejected', () => {
  assert.ok(validateRegistration({ ...registration, email: 'not-an-email' }).errors.email)
  assert.ok(validateRegistration({ ...registration, reasonDetails: 'x'.repeat(1501) }).errors.reasonDetails)
})

test('existing sheet columns remain in place, with business stage appended in J', () => {
  const { values } = validateRegistration(registration)
  assert.deepEqual(registrationRow(values, '2026-09-28T12:00:00.000Z'), [
    '2026-09-28T12:00:00.000Z', 'Ada', 'Okafor', 'ada@example.com',
    'Start an F&B business', 'An affordable lunch service.', 'Yes', 'Lagos', '',
    'Developing a product',
  ])
})
