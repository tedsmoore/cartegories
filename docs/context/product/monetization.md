# Monetization

## Revenue Model

Paid deck unlocks. The General deck is free. All other decks are paid. A "Buy All"
bundle is available at a discount.

In-app purchases handled by RevenueCat.

<!-- Ted: What price point are you thinking per deck? What about the bundle? Any
thoughts on a subscription model vs. one-time purchase? Free trial of paid decks? -->

## RevenueCat Integration

- Mobile SDK: `react-native-purchases`
- Anonymous user ID from device UUID
- Webhook → backend `POST /api/webhooks/revenuecat` to record purchases server-side
- Entitlements checked on launch, cached locally for offline access

## Pricing Strategy

<!-- Ted: How do you think about pricing? Competitive analysis? What do similar
games charge? Any plans for sales, seasonal pricing, or launch pricing? -->
