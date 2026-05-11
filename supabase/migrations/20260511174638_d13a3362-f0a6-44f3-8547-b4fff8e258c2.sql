-- Extend tips and premium_subscriptions for Paddle
alter table public.tips
  add column if not exists paddle_transaction_id text,
  add column if not exists environment text not null default 'sandbox',
  add column if not exists platform_fee_cents integer not null default 0;

alter table public.premium_subscriptions
  add column if not exists paddle_subscription_id text,
  add column if not exists paddle_customer_id text,
  add column if not exists price_id text,
  add column if not exists product_id text,
  add column if not exists environment text not null default 'sandbox',
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists current_period_start timestamptz;

create unique index if not exists premium_subscriptions_paddle_sub_id_key
  on public.premium_subscriptions(paddle_subscription_id) where paddle_subscription_id is not null;

create unique index if not exists tips_paddle_txn_id_key
  on public.tips(paddle_transaction_id) where paddle_transaction_id is not null;

-- Update has_active_premium to also consider canceled-but-still-in-period
create or replace function public.has_active_premium(_user_id uuid, _podcast_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.premium_subscriptions
    where user_id = _user_id and podcast_id = _podcast_id
      and (
        (status in ('active','trialing','past_due') and (current_period_end is null or current_period_end > now()))
        or (status = 'canceled' and current_period_end > now())
      )
  );
$$;
