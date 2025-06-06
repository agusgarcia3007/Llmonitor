export interface SubscriptionLimits {
  events?: number;
  dataRetentionDays?: number;
  users?: number;
  projects?: number;
  [key: string]: number | undefined;
}

export interface Subscription {
  id: string;
  plan: string;
  referenceId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status:
    | "active"
    | "canceled"
    | "trialing"
    | "past_due"
    | "incomplete"
    | "incomplete_expired"
    | "unpaid"
    | "paused";
  periodStart?: Date;
  periodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  seats?: number;
  trialStart?: Date;
  trialEnd?: Date;
  limits?: SubscriptionLimits;
}

export interface UpgradeSubscriptionParams {
  plan: string;
  successUrl: string;
  cancelUrl: string;
  referenceId?: string;
  annual?: boolean;
  seats?: number;
}

export interface CancelSubscriptionParams {
  returnUrl: string;
  referenceId?: string;
}

export type SubscriptionFeature =
  | "unlimited_projects"
  | "unlimited_users"
  | "events"
  | "dataRetentionDays"
  | "users"
  | "projects";
