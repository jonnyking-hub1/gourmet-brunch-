import { type NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { registrationRow, validateRegistration } from '@/lib/registration'

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { values, errors } = validateRegistration(body)
  if (Object.keys(errors).length) {
    return NextResponse.json({ error: Object.values(errors)[0], errors }, { status: 400 })
  }

  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
  const spreadsheetId = process.env.GOOGLE_SHEET_ID
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1'

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
      range: `'${sheetName.replace(/'/g, "''")}'!A:J`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [registrationRow(values, new Date().toISOString())],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Failed to write to Google Sheet:', error)
    return NextResponse.json({ error: 'We could not save your registration. Please try again.' }, { status: 502 })
  }
}
