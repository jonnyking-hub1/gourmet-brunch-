# EEA registration

This form registers attendees for EEA, F&B Edition, Cohort 01. It is not a
venture funding application. Funding and business support remain subject to
venture selection and the final investment structure.

`lib/event.ts` holds the shared programme details. The supplied flyer does not
specify a year and shows an ambiguous weekday, so site copy uses `10–11 October`.
The original flyer is displayed as supplied.

## Google Sheets

The existing service-account configuration is unchanged:
`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`, and
optional `GOOGLE_SHEET_NAME` (defaults to `Sheet1`).

The route appends to A:J. Existing rows and the A:I column order are preserved.
Use these column headings when reviewing the sheet; the app does not rewrite
headers or existing data:

| Column | Content |
| --- | --- |
| A | Registration timestamp (ISO) |
| B | First name |
| C | Last name |
| D | Email |
| E | Programme goal (previously reason for learning) |
| F | Business idea or product (previously reason details) |
| G | Business support interest |
| H | Location |
| I | University (now optional) |
| J | Business stage (new) |

Values are saved as raw text so participant input cannot be interpreted as
spreadsheet formulas. Validation is shared between the browser and API in
`lib/registration.ts`. Old form choices are no longer accepted.

Run the registration contract checks with `node --test tests/registration.test.mjs`
on Node.js 22.18+ (native TypeScript type stripping). These tests never contact
Google Sheets.
