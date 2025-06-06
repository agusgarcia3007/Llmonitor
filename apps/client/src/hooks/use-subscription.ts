import {
  useActiveSubscription,
  useSubscriptions,
} from "@/services/subscriptions/query";
import {
  useUpgradeSubscription,
  useCancelSubscription,
  useRestoreSubscription,
} from "@/services/subscriptions/mutations";
import { useGetOrganization } from "@/services/organizations/query";
import { SubscriptionService } from "@/services/subscriptions/service";
import type {
  SubscriptionFeature,
  SubscriptionLimits,
} from "@/types/subscriptions";

export function useSubscription() {
  const { data: organization } = useGetOrganization();
  const referenceId = organization?.id;

  const {
    data: subscriptions,
    isLoading: isLoadingSubscriptions,
    error: subscriptionsError,
  } = useSubscriptions(referenceId);
  const {
    data: activeSubscription,
    isLoading: isLoadingActive,
    error: activeError,
  } = useActiveSubscription(referenceId);

  const upgradeSubscription = useUpgradeSubscription();
  const cancelSubscription = useCancelSubscription();
  const restoreSubscription = useRestoreSubscription();

  const isLoading = isLoadingSubscriptions || isLoadingActive;
  const error = subscriptionsError || activeError;

  const hasActiveSubscription =
    !!activeSubscription &&
    SubscriptionService.isSubscriptionActive(activeSubscription);
  const planLimits = activeSubscription
    ? SubscriptionService.getPlanLimits(activeSubscription)
    : {};
  const currentPlan = activeSubscription?.plan;

  const canAccessFeature = (feature: SubscriptionFeature): boolean => {
    return SubscriptionService.canAccessFeature(activeSubscription, feature);
  };

  const isAtLimit = (
    feature: keyof SubscriptionLimits,
    currentUsage: number
  ): boolean => {
    return SubscriptionService.isAtLimit(
      activeSubscription,
      feature,
      currentUsage
    );
  };

  const upgrade = async (
    plan: string,
    options?: { annual?: boolean; seats?: number }
  ) => {
    return upgradeSubscription.mutateAsync({
      plan,
      successUrl: "/dashboard?upgraded=true",
      cancelUrl: "/pricing",
      referenceId,
      ...options,
    });
  };

  const cancel = async () => {
    return cancelSubscription.mutateAsync({
      returnUrl: "/dashboard?canceled=true",
      referenceId,
    });
  };

  const restore = async () => {
    return restoreSubscription.mutateAsync(referenceId);
  };

  return {
    // Data
    subscriptions,
    activeSubscription,
    hasActiveSubscription,
    currentPlan,
    planLimits,

    // Loading states
    isLoading,
    isUpgrading: upgradeSubscription.isPending,
    isCanceling: cancelSubscription.isPending,
    isRestoring: restoreSubscription.isPending,

    // Errors
    error,
    upgradeError: upgradeSubscription.error,
    cancelError: cancelSubscription.error,
    restoreError: restoreSubscription.error,

    // Actions
    upgrade,
    cancel,
    restore,

    // Utilities
    canAccessFeature,
    isAtLimit,

    // Organization context
    organization,
    referenceId,
  };
}
