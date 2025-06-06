import { useQuery } from "@tanstack/react-query";
import { SubscriptionService } from "./service";

export const useSubscriptions = (referenceId?: string) => {
  return useQuery({
    queryKey: ["subscriptions", referenceId],
    queryFn: () => SubscriptionService.getSubscriptions(referenceId),
  });
};

export const useActiveSubscription = (referenceId?: string) => {
  return useQuery({
    queryKey: ["subscriptions", "active", referenceId],
    queryFn: async () => {
      const subscriptions = await SubscriptionService.getSubscriptions(
        referenceId
      );
      return SubscriptionService.getActiveSubscription(subscriptions);
    },
  });
};
