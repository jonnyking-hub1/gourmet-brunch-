import { type NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

interface RegistrationPayload {
  firstName: string
  lastName: string
  email: string
  reason: string
  reasonDetails: string
  needsBusinessHelp: string
  location: string
  university: string
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  let body: Partial<RegistrationPayload>

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { firstName, lastName, email, reason, reasonDetails, needsBusinessHelp, location, university } = body

  if (
    !firstName?.trim() ||
    !lastName?.trim() ||
    !email?.trim() ||
    !reason ||
    !needsBusinessHelp ||
    !location?.trim() ||
    !university?.trim()
  ) {
    return NextResponse.json({ error: 'Please fill in every field.' }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
  const spreadsheetId = process.env.GOOGLE_SHEET_ID
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1'

  console.log('[v0] Using spreadsheetId:', spreadsheetId, 'sheetName:', sheetName, 'serviceAccountEmail:', serviceAccountEmail)

  if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
    console.error('[v0] Missing Google Sheets environment variables.')
    return NextResponse.json(
      { error: 'Registration is not configured yet. Please try again shortly.' },
      { status: 500 },
    )
  }

  try {
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:I`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [
          [
            new Date().toISOString(),
            firstName.trim(),
            lastName.trim(),
            email.trim().toLowerCase(),
            reason,
            reasonDetails?.trim() || '',
            needsBusinessHelp,
            location.trim(),
            university.trim(),
          ],
        ],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Failed to write to Google Sheet:', error)
    return NextResponse.json({ error: 'We could not save your registration. Please try again.' }, { status: 502 })
  }
}
