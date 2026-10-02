# EEA registration

The form registers attendees for EEA, F&B Edition, Cohort 01. It is separate
from the all-sector business pitch application. Funding and business support
remain subject to selection and the final investment structure.

Programme details live in `lib/event.ts`. The supplied flyer does not specify
a year and has an ambiguous weekday, so site copy uses `10–11 October`.

Registrations now persist in the Supabase `eea_registrations` table with a UUID
and server-generated timestamp. Shared browser/API validation is in
`lib/registration.ts`; database constraints also validate choices and lengths.
The organiser dashboard shows all fields, including optional university and
business idea. No Supabase account is required to register.

See [Supabase setup](supabase.md) for configuration. Existing Google Sheets rows
are not imported automatically or modified. The old A:J export mapping remains
in `registrationRow` for reference when importing legacy records.

Run `npm test` for validation, route, and database checks. These tests use local
fixtures and an isolated PostgreSQL runtime; they never contact a live project.
