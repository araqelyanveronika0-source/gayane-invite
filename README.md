# Գայանեի 51-ամյակ — Smart Digital Invitation

Next.js 15 · TypeScript · Tailwind · Framer Motion · Supabase (DB + Auth + Realtime) · React Hook Form · Zod

## Ֆայլերի կառուցվածք

```
supabase/schema.sql              ← աղյուսակներ + RLS
public/og.jpg                    ← Open Graph նկար (1200×630)
public/music/invitation.mp3      ← ԱՎԵԼԱՑՐԵՔ Ձեր instrumental ֆայլը
src/middleware.ts                ← /admin պաշտպանություն
src/app/invite/[slug]/page.tsx   ← հրավիրատոմս + OG metadata
src/app/api/rsvp/route.ts        ← RSVP API (zod, honeypot, rate limit)
src/app/admin/                   ← login, dashboard, signout
src/components/                  ← Envelope, Invitation, RsvpForm, Countdown, ShareButtons, MusicToggle, Flowers, AdminDashboard
src/lib/                         ← schema (zod), settings, supabase clients
```

## Տեղադրում

```bash
npm install
cp .env.example .env.local     # լրացրեք արժեքները
npm run dev                    # http://localhost:3000/invite/gayane-51
```

## Supabase

1. supabase.com → New project։
2. SQL Editor → տեղադրեք և Run արեք `supabase/schema.sql`-ի ամբողջ բովանդակությունը։
3. Authentication → Users → Add user (Ձեր email + գաղտնաբառ, «Auto confirm» միացրած)։
4. SQL Editor → `insert into public.admins (email) values ('Ձեր-email@...');`
5. Project Settings → API → պատճենեք `URL`, `anon` և `service_role` բանալիները `.env.local`-ում։
6. Database → Replication-ում ստուգեք, որ `guest_responses`-ը Realtime-ում է (SQL-ը դա անում է)։

## Environment variables

| Անուն | Նշանակություն |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon բանալի (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | **գաղտնի**, միայն սերվերում (RSVP API) |
| `NEXT_PUBLIC_SITE_URL` | վերջնական դոմեյն՝ OG և Share հղումների համար |
| `NEXT_PUBLIC_FB_APP_ID` | ըստ ցանկության, Messenger share-ի համար |

## Deploy (Vercel)

1. Նախագիծը դրեք GitHub-ում → vercel.com → Add New → Project → ընտրեք repo-ն։
2. Environment Variables-ում ավելացրեք վերևի 4–5 փոփոխականները։
3. Deploy։ Ստացված դոմեյնը դրեք `NEXT_PUBLIC_SITE_URL`-ում և Redeploy արեք։
4. Հրավիրատոմսի հղում՝ `https://<domain>/invite/gayane-51`
   Անհատական ողջույն՝ `https://<domain>/invite/gayane-51?to=Անի`
5. Admin՝ `https://<domain>/admin`

## Անվտանգություն

- Հյուրերը DB-ին ուղիղ չեն դիմում. RLS-ում INSERT policy չկա, գրում է միայն `/api/rsvp`-ը service-role-ով։
- Պատասխանները կարդալ/ջնջել կարող են միայն `admins` ցուցակի օգտատերերը։
- API-ն վավերացնում է zod-ով, ունի honeypot, նվազագույն լրացման ժամանակ և IP rate limit (5 / 10 րոպե, in-memory)։
