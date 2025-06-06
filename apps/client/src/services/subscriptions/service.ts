import { authClient } from "@/lib/auth-client";
import type {
  Subscription,
  SubscriptionLimits,
  UpgradeSubscriptionParams,
  CancelSubscriptionParams,
  SubscriptionFeature,
} from "@/types/subscriptions";

export class SubscriptionService {
  public static async getSubscriptions(
    referenceId?: string
  ): Promise<Subscription[]> {
    const { data, error } = await authClient.subscription.list({
      query: { ...(referenceId && { referenceId }) },
    });
    if (error) throw error;
    return data;
  }

  public static async upgradeSubscription(params: UpgradeSubscriptionParams) {
    const { data, error } = await authClient.subscription.upgrade({
      plan: params.plan,
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
      ...(params.referenceId && { referenceId: params.referenceId }),
      ...(params.annual && { annual: params.annual }),
      ...(params.seats && { seats: params.seats }),
    });
    if (error) throw error;
    return data;
  }

  public static async cancelSubscription(params: CancelSubscriptionParams) {
    const { data, error } = await authClient.subscription.cancel({
      returnUrl: params.returnUrl,
      ...(params.referenceId && { referenceId: params.referenceId }),
    });
    if (error) throw error;
    return data;
  }

  public static async restoreSubscription(referenceId?: string) {
    const { data, error } = await authClient.subscription.restore({
      ...(referenceId && { referenceId }),
    });
    if (error) throw error;
    return data;
  }

  public static getActiveSubscription(
    subscriptions: Subscription[]
  ): Subscription | undefined {
    return subscriptions?.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );
  }

  public static getPlanLimits(subscription: Subscription): SubscriptionLimits {
    return subscription?.limits || {};
  }

  public static isSubscriptionActive(subscription: Subscription): boolean {
    return (
      subscription?.status === "active" || subscription?.status === "trialing"
    );
  }

  public static canAccessFeature(
    subscription: Subscription | null | undefined,
    feature: SubscriptionFeature
  ): boolean {
    if (!subscription || !this.isSubscriptionActive(subscription)) {
      return false;
    }

    const limits = this.getPlanLimits(subscription);

    switch (feature) {
      case "unlimited_projects":
        return limits.projects === -1;
      case "unlimited_users":
        return limits.users === -1;
      default:
        return true;
    }
  }

  public static isAtLimit(
    subscription: Subscription | null | undefined,
    feature: keyof SubscriptionLimits,
    currentUsage: number
  ): boolean {
    if (!subscription || !this.isSubscriptionActive(subscription)) {
      return true;
    }

    const limits = this.getPlanLimits(subscription);
    const limit = limits[feature];

    if (limit === -1) return false;
    if (typeof limit !== "number") return false;

    return currentUsage >= limit;
  }
}
