## What I'll build

### 1. Monetization — Tips + Premium subscriptions (Paddle)
The eligibility check **recommends Paddle**, but with a heads-up: podcast platforms with creator monetisation can require **extra review by Paddle before going live**. Test mode works immediately; live payouts depend on approval.

If you confirm, I'll:
- Enable Lovable's built-in **Paddle** payments (test environment auto-provisioned).
- Create two product templates: **Tip** (custom amount, one-time) and **Premium subscription** (monthly per podcast).
- Add a `Tip` button on every channel/episode page with $3 / $5 / $10 + custom.
- Add a `Subscribe to premium` button on channel pages → Paddle checkout.
- Webhook handler writes to existing `tips` and `premium_subscriptions` tables, then unlocks `is_premium` episodes via existing `has_active_premium()` RLS.
- Show earnings on the **Monetization** dashboard page (today it's a placeholder).

> Confirm and I'll call `enable_paddle_payments`. If you'd rather use Stripe (more complex tax setup, no extra review), say so.

### 2. Live YouTube channel analytics (per creator)
Lovable Cloud's managed Google sign-in doesn't include the YouTube Analytics scope, so per-creator **private** analytics would need a separate OAuth app. The fastest, no-extra-setup path is **public live stats** from each creator's own channel via the existing `YOUTUBE_API_KEY`:

- New section on **Dashboard → Analytics** called "YouTube live".
- Creator pastes/saves their YouTube channel URL or `@handle` (stored on `profiles.social_links` or a new `youtube_channel_id` column on profiles).
- Edge function `youtube-channel-stats` returns subscribers, total views, video count, and the latest 5 videos with views/likes/comments — refreshed live on page open.
- If you later want **watch-time / retention** (private metrics), I'll wire up a dedicated YouTube OAuth flow.

### 3. Nav + profile changes
- **Remove** the "Dashboard" button from the top nav (both `PublicNav` and `DashboardLayout`). Keep just the profile avatar/icon.
- Profile avatar dropdown → "My profile", "Sign out".
- On the user's own `ProfilePage`, add a **"Open dashboard"** button right under "Edit profile".

### 4. Publisher card on listening surfaces
- On `ChannelPage` and the episode player, add a small **publisher card** (avatar + name + follow button + link to `/u/{username}`) so listeners can jump to the creator's profile.

### 5. Force profile-setup wizard after email/password signup (soft gate)
- Update `OnboardingGate`: any logged-in user without `username` is redirected to `/onboarding` whenever they hit `/dashboard/*` or `/u/*` for themselves. Public pages stay open.
- After signup in `Auth.tsx`, push directly to `/onboarding` instead of `/dashboard/overview`.
- Wizard already exists; I'll just make sure it requires username + display name + 1 category before marking `is_setup_complete = true`.

## Technical notes
- DB: add `profiles.youtube_channel_id text` (nullable). No other schema changes; `tips` and `premium_subscriptions` already exist.
- Edge functions: `youtube-channel-stats` (new), `paddle-webhook` (new, added by enable tool), `create-tip-checkout` and `create-subscription-checkout` (new).
- All Paddle product IDs stored in a tiny `monetization_products` table keyed by `podcast_id`.
- Files touched: `PublicNav`, `DashboardLayout`, `ProfilePage`, `Auth`, `OnboardingGate`, `ChannelPage`, `Monetization`, `Analytics`, plus new `PublisherCard`, `TipDialog`, `SubscribeButton`, `YouTubeLiveStats` components.

## Order of operations
1. Confirm Paddle (or Stripe) and I'll enable it now.
2. While you're confirming, I'll ship items **3, 4, 5** + the YouTube live panel (no payment dependency).
3. Once payments is enabled, I'll wire up the tip/subscribe buttons and webhook.

**Reply "go Paddle" to proceed, or pick another provider.**