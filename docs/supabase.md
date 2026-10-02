# Supabase setup

The local application is connected to Supabase. Live checks passed on
2 October 2026 for organiser sign-in, programme registration, pitch intake,
PDF upload, reviews, private downloads, and sign-out. Temporary test records
and files were removed, and the original intake setting was restored.

Organiser access has been created for `virusiatechindustries@gmail.com`.
The initial password is stored as `EEA_ADMIN_INITIAL_PASSWORD` in the ignored
`.env.local` file. Run `npm run dev` and visit `http://localhost:3000/admin`
to sign in. The local server is stopped after verification.

The steps below describe setup for a new project or another environment. The
initial SQL migration is already applied to the connected project; do not run
it again there. Production deployment still needs the Supabase environment
variables configured separately. No legacy records have been imported.

## 1. Create the project and database

Create a Supabase project, then open its SQL Editor and run the complete contents
of [the migration](../supabase/migrations/20261001000000_eea.sql) once.
It creates four tables, the closed intake setting, the submission function,
and the private `eea-pitch-decks` storage bucket.

The migration enables row-level security and revokes direct access from
anonymous and authenticated clients. All data and storage access goes through
server routes with the secret key; admin routes additionally verify the signed-in
user against `eea_admins`. There are no public Storage policies to add.
Use a dedicated project without broad existing Storage policies.

## 2. Set environment variables

Copy the names from [.env.example](../.env.example) into the ignored
`.env.local` file and fill in:

- `SUPABASE_URL`: project URL.
- `SUPABASE_PUBLISHABLE_KEY`: publishable key (legacy anon key also works).
- `SUPABASE_SECRET_KEY`: secret key (legacy service_role key also works).
- `SUPABASE_ADMIN_EMAIL`: already defaults to `virusiatechindustries@gmail.com`.
- `APP_ORIGIN`: optional canonical site origin, without a trailing slash.

Get the keys from the project's API Keys settings. Keep the secret key local
or in the deployment's private environment settings; never use a `NEXT_PUBLIC_`
name for it. Old Google Sheets, Blob, `ADMIN_PASSWORD`, and
`ADMIN_SESSION_SECRET` values can be removed after any legacy data migration.
They are ignored by the new application.

Run `npm run check:supabase` to verify the schema, credentials, and private bucket.
This command only reads configuration and records; it does not submit test data.

## 3. Create the organiser account

Run `npm run setup:admin` locally after applying the migration.
It grants organiser access to `virusiatechindustries@gmail.com` (or
`SUPABASE_ADMIN_EMAIL` if explicitly changed).

If that Auth account does not exist, the script creates it with a random password,
saved as `EEA_ADMIN_INITIAL_PASSWORD` in your ignored `.env.local`. Read that
value locally to sign in. The password is never printed, and no email is sent.
An existing account keeps its current password. Rerunning the script is safe.

The script confirms the specified account directly using the server credential.
Only run it for an address you control. There is no public admin signup or password
reset flow in the website; account recovery is managed through Supabase Auth.

Optional manual path: create an email/password user in Supabase Auth, then run:

```sql
insert into public.eea_admins (user_id)
select id from auth.users
where lower(email) = 'virusiatechindustries@gmail.com'
on conflict (user_id) do nothing;
```

To remove organiser access, delete that user's `eea_admins` row. Do not add
policies allowing users to edit this table.

## 4. Verify and deploy

Restart the app after changing environment variables. Set the three Supabase
connection variables in deployment settings too; `SUPABASE_ADMIN_EMAIL` and
`EEA_ADMIN_INITIAL_PASSWORD` are local setup values, not runtime requirements.

In the actual project:

1. Sign in at `/admin` and confirm an empty dashboard loads.
2. Submit an F&B programme registration and verify it appears.
3. Open pitch intake, submit a PDF with an idea from any sector, and confirm it appears.
4. Save a review and download the deck.
5. Close intake and confirm new submissions are rejected.
6. Sign out and confirm dashboard/API/deck access requires sign-in.

The test suite verifies SQL locally with PGlite and mocks Auth/Storage responses.
It does not replace these live checks against Supabase Auth and Storage.

## Existing records

The app stops writing to Google Sheets and Vercel Blob after this change.
Nothing is deleted from either service. If they contain live records, export and
import them before switching production traffic. Registration A:J mapping is
documented in `lib/registration.ts`; old pitch decks must be copied into the new
private bucket and mapped to `pitches/<pitch UUID>/deck.pdf`.
No live import has been attempted.

References: [Supabase server-side auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client),
[API keys](https://supabase.com/docs/guides/getting-started/api-keys),
[row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security).
