import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifyWebhook, EventName, type PaddleEnv } from '../_shared/paddle.ts';

const PLATFORM_FEE_BPS = 2000; // 20%

let _supabase: ReturnType<typeof createClient> | null = null;
function db() {
  if (!_supabase) {
    _supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  }
  return _supabase;
}

async function handleSubscriptionCreated(data: any, env: PaddleEnv) {
  const { id, customerId, items, status, currentBillingPeriod, customData } = data;
  const userId = customData?.userId;
  const podcastId = customData?.podcastId;
  if (!userId || !podcastId) {
    console.warn('Missing userId or podcastId in customData', customData);
    return;
  }
  const item = items[0];
  const priceId = item.price.importMeta?.externalId;
  const productId = item.product.importMeta?.externalId;
  if (!priceId || !productId) {
    console.warn('missing importMeta.externalId', { rawPriceId: item.price.id, rawProductId: item.product.id });
    return;
  }
  await db().from('premium_subscriptions').upsert({
    user_id: userId,
    podcast_id: podcastId,
    paddle_subscription_id: id,
    paddle_customer_id: customerId,
    product_id: productId,
    price_id: priceId,
    status,
    current_period_start: currentBillingPeriod?.startsAt,
    current_period_end: currentBillingPeriod?.endsAt,
    environment: env,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'paddle_subscription_id' });
}

async function handleSubscriptionUpdated(data: any, env: PaddleEnv) {
  const { id, status, currentBillingPeriod, scheduledChange } = data;
  await db().from('premium_subscriptions').update({
    status,
    current_period_start: currentBillingPeriod?.startsAt,
    current_period_end: currentBillingPeriod?.endsAt,
    cancel_at_period_end: scheduledChange?.action === 'cancel',
    updated_at: new Date().toISOString(),
  }).eq('paddle_subscription_id', id).eq('environment', env);
}

async function handleSubscriptionCanceled(data: any, env: PaddleEnv) {
  await db().from('premium_subscriptions').update({
    status: 'canceled',
    updated_at: new Date().toISOString(),
  }).eq('paddle_subscription_id', data.id).eq('environment', env);
}

async function handleTransactionCompleted(data: any, env: PaddleEnv) {
  // Only record tip transactions (one-time, marked via customData.kind = 'tip')
  if (data.customData?.kind !== 'tip') return;
  const { id, items, customData, currencyCode } = data;
  const item = items[0];
  const priceExternalId = item.price?.importMeta?.externalId;
  if (priceExternalId !== 'tip_unit') return;

  const qty = item.quantity ?? 1;
  const unit = parseInt(item.price?.unitPrice?.amount ?? '100', 10);
  const totalCents = unit * qty;
  const platformFeeCents = Math.round((totalCents * PLATFORM_FEE_BPS) / 10000);

  await db().from('tips').upsert({
    paddle_transaction_id: id,
    podcast_id: customData.podcastId,
    episode_id: customData.episodeId ?? null,
    user_id: customData.userId ?? null,
    amount_cents: totalCents,
    platform_fee_cents: platformFeeCents,
    currency: (currencyCode || 'usd').toLowerCase(),
    message: customData.message ?? null,
    status: 'paid',
    environment: env,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'paddle_transaction_id' });
}

async function handleWebhook(req: Request, env: PaddleEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.eventType) {
    case EventName.SubscriptionCreated:
      await handleSubscriptionCreated(event.data, env);
      break;
    case EventName.SubscriptionUpdated:
      await handleSubscriptionUpdated(event.data, env);
      break;
    case EventName.SubscriptionCanceled:
      await handleSubscriptionCanceled(event.data, env);
      break;
    case EventName.TransactionCompleted:
      await handleTransactionCompleted(event.data, env);
      break;
    default:
      console.log('Unhandled event:', event.eventType);
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const url = new URL(req.url);
  const env = (url.searchParams.get('env') || 'sandbox') as PaddleEnv;
  try {
    await handleWebhook(req, env);
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('Webhook error:', e);
    return new Response('Webhook error', { status: 400 });
  }
});
