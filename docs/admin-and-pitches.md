# EEA organiser dashboard and business pitches

- `/admin`: organiser dashboard; requires Supabase Auth and an `eea_admins` entry.
- `/admin/login`: email and password sign-in.
- `/pitch`: public pitch information and submission form.
- The home-page pitch invitation follows the saved intake setting.

The learning programme remains the F&B edition. Pitches accept all sectors,
including ideas and operating businesses. Ideas explain their route to first
sales; operating businesses report turnover with currency and period. Both
explain customers, the revenue model, and support sought. Programme registration
is not required to submit a pitch.

## Setup and access

Follow [Supabase setup](supabase.md). Registrations, pitches, intake settings,
organiser membership, authentication, and private files now use Supabase.
The former Google Sheets, shared admin password, and Vercel Blob configuration
are no longer used. Existing remote records and files are left untouched.

The dashboard reads records through protected server routes. A verified Supabase
user must also appear in `eea_admins`; public signup or editable user metadata
cannot grant access. Sessions refresh through HttpOnly cookies. Removing an
`eea_admins` row revokes dashboard access on the next request, even with a
still-valid session. Sign-out ends the current Supabase session.

## Records and reviews

The dashboard searches registrations and pitches and filters pitches by status.
Statuses are New, Reviewing, Shortlisted, and Not selected. Notes remain private.
Saving a review does not email the founder or award funding. Concurrent reviews
use the latest write. Database reads page through records past the default
1,000-row API limit; keep the project's Data API max rows at 1,000 or higher.

## Upload and intake behaviour

PDF decks are limited to 4 MiB. Extension, size, and PDF signature are checked
server-side; the private bucket also restricts file size and MIME type.
Downloads require organiser access, use attachment responses, and never expose
a public storage URL. Format validation is not a malware scan.

Intake starts closed. Public indicators refresh every 30 seconds and on focus,
with up to 10 seconds of public caching. Submission checks intake before upload
and again after upload. A database function locks the setting while inserting,
so closing cannot race a new insert. Once a close operation finishes, no new
submission can pass. Closing does not remove previously accepted pitches.

A definite closed-intake rejection removes the unlinked file. If a database
write times out with an uncertain result, its private file is retained in case
the record committed. Reconcile orphan files in `eea-pitch-decks` against
`eea_pitches.deck_path` after such failures. Repeated submissions are not
deduplicated; keep the submission reference for support.

The app includes same-origin mutation checks and a per-instance login limit.
Configure deployment-level rate limits for `/api/admin/login`, `/api/register`,
and `/api/pitches` before opening public intake.

## Verification

Run `npm test`, `npm run typecheck`, and `npm run build`. Tests cover API
permissions, both business stages, intake enforcement, uploads, review updates,
private downloads, pagination, and the SQL migration's constraints and grants.
Once a real project is configured, `npm run check:supabase` performs read-only
connection and schema checks. Complete the live smoke test in the setup guide.
