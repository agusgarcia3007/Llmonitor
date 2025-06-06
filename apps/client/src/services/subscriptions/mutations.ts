import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SubscriptionService } from "./service";
import type {
  UpgradeSubscriptionParams,
  CancelSubscriptionParams,
} from "@/types/subscriptions";

export const useUpgradeSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: UpgradeSubscriptionParams) =>
      SubscriptionService.upgradeSubscription(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CancelSubscriptionParams) =>
      SubscriptionService.cancelSubscription(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
};

export const useRestoreSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (referenceId?: string) =>
      SubscriptionService.restoreSubscription(referenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
};
