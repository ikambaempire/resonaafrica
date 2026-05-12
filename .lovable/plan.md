# Build plan — Discover redesign, email subscriptions, studio bookings

## 1. YouTube-style Discover + Watch page

**Discover page (`/discover`)**
- Sticky horizontal chip bar at the top: "All" + every category from `categories` (scrollable).
- Default view (no chip selected): three rails — "Trending now" (top podcasts by plays), "New episodes" (latest published episodes), "Recommended" (rest).
- Selecting a chip switches to a single responsive grid for that category.
- Cards show: thumbnail (16:9 with duration badge), title, podcast/channel name, plays + age. Hover reveals a subtle gradient + play icon.
- Click on an episode card → new `/watch/:episodeId` page.

**Watch page (`/watch/:episodeId`)**
- Main player on the left (existing `AudioPlayer` for audio, YouTube embed for video episodes).
- Title, channel row (avatar + name + subscribe-by-email button + tip button + premium button).
- Description / show notes panel (expandable).
- Right column: "Up next" rail = other episodes from the same podcast, then trending across platform.
- Records a play in `episode_plays` on load.

## 2. Email subscriptions for new episodes

**Per-podcast subscribe**
- New `podcast_subscribers` table: `id, podcast_id, email, user_id?, created_at, unsubscribe_token`.
- "Subscribe" button on each channel page + watch page → small dialog asking for email (pre-filled if logged in).
- Confirmation email sent immediately ("You're subscribed to <podcast>").

**Global newsletter**
- New `newsletter_subscribers` table: `id, email, created_at, unsubscribe_token`.
- Inline form in the footer.

**Auto-send when a new episode publishes**
- DB trigger on `episodes` (when `status` flips to `published`) calls a new edge function `notify-new-episode` via pg_net, which:
  - Fans out to every `podcast_subscribers.email` for that podcast (queued through Lovable Email infra → one email per recipient via `send-transactional-email`).
  - Adds a row to a `newsletter_digest_queue` so a weekly digest job can email global subscribers.
- Two new transactional templates: `new-episode-notification`, `subscription-confirmation`. (Weekly digest can be added later.)

**Prereq:** Lovable Cloud email domain must be set up — I'll prompt that first if not already done, then auto-continue.

## 3. Studio owners + booking system

**Role + onboarding**
- Add `studio_owner` to `app_role` enum.
- Onboarding step 1 asks: "I'm a Podcaster" / "I'm a Studio Owner" → assigns role + routes to the right dashboard.
- Public CTA "List your studio" on Ecosystem page → `/studios/signup` (auth + auto-assign `studio_owner`).

**Tables**
- `studios`: owner_id, name, slug, city, country, description, hourly_rate_cents, currency, photos[], amenities[], capacity, is_published, paddle_price_id (auto-created at $X/hr).
- `studio_availability`: studio_id, weekday, start_time, end_time (recurring weekly windows).
- `studio_bookings`: id, studio_id, owner_id, booker_user_id, booker_email, booker_name, start_at, end_at, hours, total_cents, platform_fee_cents (20%), status (`pending_payment` | `confirmed` | `cancelled` | `completed`), paddle_transaction_id, notes, created_at.

**Studio Owner dashboard (`/studio`)**
- New `StudioOwnerLayout` (sidebar): Overview, My Studios (CRUD), Bookings (list + approve/decline), Earnings, Settings.
- `useIsStudioOwner` hook + `StudioOwnerRoute` guard.

**Public studio listing**
- New `/studios` page: searchable grid of published studios.
- `/studios/:slug` page: photos, description, rate, "Book this studio" → date/time/duration picker → Paddle checkout (price computed = hours × rate). Webhook (`payments-webhook`) records `studio_booking` with 20% fee on `TransactionCompleted`.

**Admin**
- New `/admin/studios` page: list every studio + every booking, filter by date/studio/status.
- Add "Studios" + "Bookings" links to AdminLayout sidebar.

**Notifications**
- Booking confirmation email to booker + owner via `send-transactional-email`.

---

## File map (high level)

**New tables / migration**
- `supabase/migrations/<ts>_youtube_discover_subs_studios.sql` — adds enum value, all new tables, RLS, trigger for new-episode notifications.

**Edge functions**
- `supabase/functions/notify-new-episode/index.ts` (fans out subscriber emails)
- Updates to `supabase/functions/payments-webhook/index.ts` (handle `kind: "studio_booking"` in customData)
- New transactional templates under `_shared/transactional-email-templates/`

**Frontend**
- `src/pages/Discover.tsx` (rewrite — YouTube layout)
- `src/pages/Watch.tsx` (new)
- `src/components/discover/CategoryChips.tsx`, `EpisodeCard.tsx`, `UpNextRail.tsx`
- `src/components/SubscribeByEmailButton.tsx`
- `src/components/NewsletterSignup.tsx` (in Footer)
- `src/pages/Studios.tsx`, `src/pages/StudioDetail.tsx`, `src/pages/StudioSignup.tsx`
- `src/pages/studio/*` (Overview, MyStudios, StudioEditor, Bookings, Earnings)
- `src/components/layout/StudioOwnerLayout.tsx`
- `src/components/StudioOwnerRoute.tsx`, `src/hooks/useIsStudioOwner.ts`
- `src/pages/admin/AdminStudios.tsx` + sidebar link
- `src/pages/Onboarding.tsx` (add role-choice step)
- `App.tsx` route additions

## Notes / trade-offs
- Weekly newsletter digest is wired (queue + button) but the cron job that actually sends it is deferred — say the word and I'll add it.
- Studio availability uses recurring weekly windows + per-booking conflict check; full calendar UI can come later.
- Existing tip / premium flows are untouched. The studio booking checkout reuses the same Paddle pipeline with `kind: "studio_booking"` in customData.
- "Up next" on watch page is heuristic (same podcast first, then trending) — no ML.
