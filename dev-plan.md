# LLMonitor Billing Implementation Plan

## Overview

Implementation of subscription billing using Better Auth Stripe plugin with Stripe-hosted billing management.

## Current Status ✅

- [x] Better Auth Stripe plugin installed (client & server)
- [x] Stripe client configured with API keys
- [x] Database schema updated with subscription table
- [x] Subscription plans configured in auth.ts (hobby, pro)
- [x] Stripe webhooks configured and endpoints set up
- [x] Products and prices created in Stripe dashboard

## Implementation Phases

### Phase 1: Core Subscription Functionality

#### 1.1 User Subscription State Management

- Implement subscription status checking in user session
- Add subscription info to user context/state management
- Create utility functions to check current user's subscription
- Handle subscription status (active, trialing, canceled, past_due)

#### 1.2 Plan Upgrade/Downgrade Flow

- Create subscription upgrade functionality using `authClient.subscription.upgrade()`
- Implement success/cancel URL handling after Stripe checkout
- Add proper error handling for failed payments
- Support both personal and organization-level subscriptions

#### 1.3 Subscription Access Control

- Implement subscription-based feature gating
- Check plan limits (events, data retention, users, projects)
- Add middleware/guards for protected features
- Display plan limitations in UI

### Phase 2: User Interface Components

#### 2.1 Subscription Status Display

- Create subscription status badge/indicator
- Show current plan and billing period
- Display usage vs limits
- Add billing cycle information

#### 2.2 Plan Management Integration

- Add "Upgrade Plan" buttons in appropriate locations
- Integrate with existing UI components
- Handle loading states during checkout process
- Success/failure notifications

#### 2.3 Billing Portal Integration

- Implement Stripe Customer Portal access
- Add "Manage Billing" buttons that redirect to Stripe portal
- Handle billing portal return URLs
- Customer portal handles: payment methods, invoices, subscription changes

### Phase 3: Organization-Level Billing

#### 3.1 Organization Subscription Support

- Enable organization owners/admins to manage subscriptions
- Use organization ID as referenceId for subscriptions
- Implement seat-based billing for team plans
- Handle organization member access based on subscription

#### 3.2 Permission System Integration

- Extend authorizeReference function for complex permission scenarios
- Handle multi-organization users
- Restrict subscription management to appropriate roles

### Phase 4: Usage Monitoring & Limits

#### 4.1 Usage Tracking

- Track LLM events against subscription limits
- Implement real-time usage counters
- Add usage warning notifications
- Handle overage scenarios

#### 4.2 Plan Enforcement

- Block features when limits are exceeded
- Graceful degradation for free tier users
- Prompt for upgrades when approaching limits
- Add event recording based on plan quotas

### Phase 5: Advanced Features

#### 5.1 Add-on Products

- Implement additional events add-on (already created in Stripe)
- Handle metered billing for overages
- Support multiple add-ons per subscription

#### 5.2 Trial Management

- Implement free trial periods
- Handle trial expiration
- Convert trials to paid subscriptions
- Trial experience optimization

#### 5.3 Webhook Event Handling

- Process subscription lifecycle events
- Update local subscription status from webhooks
- Handle failed payment scenarios
- Implement subscription recovery flows

## Technical Implementation Details

### Database Considerations

- Subscription table already created with proper schema
- Track subscription status locally for performance
- Sync with Stripe webhook events
- Handle webhook idempotency

### Frontend Integration Points

- Dashboard: Show subscription status and usage
- Settings/Account: Subscription management
- Feature access: Plan-based restrictions
- Navigation: Plan-specific menu items

### API Endpoints to Utilize

- `POST /api/auth/stripe/webhook` - Already configured
- Better Auth subscription methods:
  - `subscription.upgrade()`
  - `subscription.list()`
  - `subscription.cancel()`
  - `subscription.restore()`

### Error Handling Strategy

- Payment failures during checkout
- Webhook processing failures
- Subscription status sync issues
- User permission errors

## Testing Strategy

### 1. Stripe Test Mode

- Use test credit cards for payment flows
- Test webhook delivery in development
- Verify subscription lifecycle events

### 2. Local Development

- Use Stripe CLI for webhook forwarding
- Test all subscription states
- Verify permission systems

### 3. Edge Cases

- Failed payments
- Webhook delivery failures
- Concurrent subscription changes
- Organization permission scenarios

## Deployment Considerations

### Environment Variables Required

- STRIPE_SECRET_KEY (already set)
- STRIPE_WEBHOOK_SECRET (already set)
- STRIPE_PUBLISHABLE_KEY (for frontend if needed)

### Production Checklist

- Switch to live Stripe keys
- Configure production webhook endpoints
- Test live payment flows
- Monitor webhook delivery reliability

## Success Metrics

- Successful subscription creation rate
- Payment failure handling
- User upgrade conversion
- Billing portal utilization
- Customer satisfaction with billing experience

## Future Enhancements

- Custom pricing for enterprise customers
- Multi-currency support
- Advanced usage analytics
- Automated dunning management
- Referral program integration
