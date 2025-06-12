import { SimpleAlertsEvaluator } from "@/lib/simple-alerts-evaluator";

export class AlertService {
  private alertsEvaluator: SimpleAlertsEvaluator;

  constructor() {
    this.alertsEvaluator = new SimpleAlertsEvaluator();
  }

  async evaluateAlerts(): Promise<void> {
    await this.alertsEvaluator.evaluateAlertsForAllUsers();
  }
}
