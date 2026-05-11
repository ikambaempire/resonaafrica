
This is a sizable build, grouped into 5 shippable phases. Each phase is self-contained so we can verify before moving on.

## Phase 1 — Nav swap: Ecosystem ↔ Services

- In `PublicNav.tsx` (and mobile menu), move **Ecosystem** under the **Solutions** dropdown where Services currently sits, and promote **Services** to the top-level slot where Ecosystem was.
- No page-content changes — both `/ecosystem` and `/services` routes stay live.

## Phase 2 — Admin ecosystem: image + video uploads

- `AdminEcosystem.tsx`: replace the plain "Logo URL" / "Cover image URL" text inputs with real file pickers that upload to a new `ecosystem-media` public storage bucket (or reuse `podcast-covers` with an `ecosystem/` prefix — leaning toward a new bucket for clarity).
- Add an optional **video URL** field (YouTube/Vimeo/MP4); on the public `Ecosystem.tsx` cards, if a `video_url` exists, render an embedded player in place of the cover image.
- DB migration: `ALTER TABLE ecosystem_entries ADD COLUMN video_url text`.
- New bucket `ecosystem-media` (public) with RLS allowing admin write + public read.

## Phase 3 — Creator profiles (IG-style) + signup setup wizard

**Schema** (migration):
- Extend `profiles` with: `username` (unique slug), `bio`, `category`, `cover_url`, `is_setup_complete boolean default false`, `profile_kind` text ('podcaster' | 'studio' | 'listener').
- New table `profile_followers` (`profile_id`, `follower_id`, unique pair) for subscriber counts. RLS: anyone can read counts, authenticated users insert/delete their own follows.
- Update `profiles` RLS: add a public read policy on `(username is not null)` so profile pages are visible to anyone.

**Profile page** — new route `/u/:username`:
- Avatar, cover banner, display name, @username, category badge, bio, subscriber count, follow button, "Powered by Resona" footer chip.
- Tabs: **Episodes** (their published episodes), **Podcasts** (shows they own), **About**.
- Layout inspired by IG: cover banner + circular avatar overlap + stats row (podcasts / episodes / subscribers) + tabbed grid.

**Setup wizard** — new route `/onboarding`:
- Auto-redirect after first sign-in if `is_setup_complete=false`.
- Steps: (1) Choose role (Podcaster / Studio owner / Just listening) → (2) Pick username & display name → (3) Upload avatar + cover → (4) Bio + category + socials → (5) "Connect platforms" (links to integrations wizard, skippable) → (6) Done → redirect to `/dashboard` or `/u/:username`.
- Saves to `profiles` and flips `is_setup_complete=true`.

## Phase 4 — Real YouTube view tracking

**Setup**:
- Add secret `YOUTUBE_API_KEY` (I'll request it via add_secret — user creates a free key at console.cloud.google.com, enables "YouTube Data API v3"). I'll prep infrastructure first.

**Schema**:
- `ALTER TABLE episodes ADD COLUMN youtube_video_id text, youtube_views bigint default 0, youtube_views_synced_at timestamptz`.
- Backfill: parse existing `embed_url` for YouTube IDs.

**Edge function** `sync-youtube-views`:
- Batches up to 50 video IDs per call (YouTube API limit), updates `youtube_views` + `youtube_views_synced_at`.
- Scheduled hourly via `pg_cron` + `pg_net`.

**Surfacing the split**:
- `HeroTopPodcasts` (top-10 on landing): change `get_top_podcasts` SQL function to return `resona_views` + `youtube_views` + `total_views = resona + youtube`, ordered by total. Display two small chips per card.
- `ChannelStats` (creator dashboard): split bar chart into "Resona views" vs "YouTube views".
- `AdminOverview`: add a top-level "Views by source" card.

## Phase 5 — Integrations setup wizard + YouTube one-click channel import

**Wizard UI** at `/dashboard/integrations/setup`:
- Stepper: pick platform → paste profile URL → preview → confirm.
- For YouTube: paste channel URL (e.g. `youtube.com/@handle` or `/channel/UCxxx`), we fetch the channel's `uploads` playlist via YouTube Data API, list the latest 25 videos with checkboxes, user clicks "Import selected" → we create `episodes` rows (`hosting='embed'`, `embed_provider='youtube'`, `embed_url`, `youtube_video_id` populated, status='published'). Cover thumbnail from YouTube.
- For Spotify/SoundCloud/Apple: keep the existing guided "paste a link" flow (no public bulk-import API for podcasts without OAuth — would need a follow-up).
- Persist linked accounts in a new `creator_integrations` table (`user_id`, `provider`, `external_id`, `external_url`, `last_synced_at`).

**Edge function** `import-youtube-channel`:
- Input: `{ channelUrl, podcastId, videoIds: string[] }`.
- Resolves handle → channelId → uploads playlist → fetches selected videos → inserts episodes.

---

## Technical details

- All new uploads go through Supabase Storage with signed-URL or public-bucket reads, matching existing podcast-covers pattern.
- All new tables get RLS — public read where safe (profiles, follower counts), authenticated write scoped to `auth.uid()`.
- The signup wizard is gated by a check on `profiles.is_setup_complete` in `AuthContext` or a top-level effect in `App.tsx`.
- YouTube Data API quota: 10,000 units/day free; `videos.list` = 1 unit per call (50 IDs each), `playlistItems.list` = 1 unit. Hourly sync of ~500 videos uses ~24 units/day. Plenty of headroom.
- YouTube view counts on landing are read from cached DB columns (no API calls on page load), so it stays fast and free.

## Suggested order of delivery

Given the size, I propose shipping in 3 batches so you can test as we go:

1. **Batch A (small)**: Phase 1 (nav swap) + Phase 2 (ecosystem media uploads). ~30 min build.
2. **Batch B (medium)**: Phase 3 (profiles + wizard). ~1 hr build.
3. **Batch C (large)**: Phases 4 + 5 (YouTube views + import). Requires you to provide a YouTube Data API key. ~1.5 hr build.

I'll start with **Batch A** as soon as you approve. For Batch C, I'll ask for the YouTube API key when we get there — you don't need it yet.
