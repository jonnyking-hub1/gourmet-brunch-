# Deploy EEA to Vercel

The confirmed programme date is **10–11 October 2026**, at **7PM WAT** on
Google Meet. Vercel hosts the Next.js app; Supabase stores registrations,
pitches, organiser accounts, intake settings, and private PDF decks.

## Import the repository

Commit and push the reviewed changes, including the new logo assets, favicon,
and `vercel.json`, to the GitHub repository before importing or redeploying it.
Local edits are not included in Git-based deployments until pushed.

In Vercel, choose **Add New → Project** and import
`jonnyking-hub1/gourmet-brunch-`. Use:

| Setting | Value |
| --- | --- |
| Framework preset | Next.js |
| Root directory | Repository root (`./`) |
| Node.js version | 24.x |
| Install command | `npm ci` (set by `vercel.json`) |
| Build command | `npm run build` (set by `vercel.json`) |
| Output directory | Leave the Next.js default |

The repository contains both npm and pnpm lockfiles. Vercel explicitly uses
the committed `package-lock.json` through `npm ci`, matching the npm workflow
used to verify this app. No Corepack configuration is needed for this setup.
Production builds now check TypeScript and fail on type errors.

Vercel documents [file-based build settings](https://vercel.com/docs/project-configuration/vercel-json),
[package manager selection](https://vercel.com/docs/package-managers), and
[Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

## Add environment variables before deploying

Copy these three values from the local `.env.local` into the Vercel project's
**Environment Variables**, with **Production** selected:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

Keep their existing names without a `NEXT_PUBLIC_` prefix. Mark the secret key
as sensitive. The connected Supabase project already has the migration and
organiser account; do not rerun setup just to deploy the frontend.

Leave `APP_ORIGIN` unset initially so requests work on their actual Vercel
hostname. If a single canonical domain is enforced later, set it to that
HTTPS origin with no trailing slash in Production only. Preview deployments
should leave it unset or use their own origin.

`SUPABASE_ADMIN_EMAIL` and `EEA_ADMIN_INITIAL_PASSWORD` are local setup values;
they are not needed on Vercel. Do not upload `.env.local` or the old Sheets,
Blob, and shared-password credentials.

For authenticated preview testing, use a separate Supabase project when
available. A preview configured with the production credentials shares live
records and the pitch intake switch. Limit such previews to trusted reviewers.

Deploy after saving the variables. Changes to Vercel environment variables
take effect on a new deployment. See [Vercel environment variables](https://vercel.com/docs/environment-variables).

## Configure request limits

Before opening public intake, configure a Vercel Firewall rate-limit rule for
**POST** requests whose path is `/api/admin/login`, `/api/register`, or
`/api/pitches`. A starting point is a fixed window of **20 requests per minute
per IP**, combined across those three paths, with **Deny** as the action once
exceeded. Adjust based on actual traffic and shared networks.

One combined rule fits the current Hobby allowance of one rate-limit rule;
other plans can use separate rules. This rule is configured in the Vercel
dashboard, not by this repository. The app's login limit is per running server
instance and does not replace a shared platform limit. See
[Vercel WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting).

The app accepts PDFs up to 4 MiB and caps the total pitch request at 4 MiB plus
64 KiB, below Vercel's documented 4.5 MB request limit. Private deck downloads
also stay within that limit. See [Vercel Function limits](https://vercel.com/docs/functions/limitations).

## Verify the deployed site

Run these checks on the actual HTTPS deployment before announcing it:

1. Confirm the home page shows **10–11 October 2026**, and the logo and favicon
   load on the pitch page, admin sign-in page, and dashboard at mobile and desktop sizes.
2. Sign in at `/admin` with the existing organiser account and confirm records load.
3. Submit one clearly labelled test programme registration and find it in the dashboard.
4. Note the current intake setting, open submissions, and submit a test pitch
   from a non-F&B sector with a PDF. Save a review and download the private deck.
5. Close intake and verify the public page rejects new pitches. Restore the
   intended launch setting and remove the identified test records and file.
6. Sign out and confirm the dashboard and private deck require authentication.

The local Supabase checks have passed; Vercel's environment, runtime, and
firewall still require verification on the deployed URL.
