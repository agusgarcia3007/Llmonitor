import { AlertService } from "@/services/alerts";

export class AlertScheduler {
  private alertService: AlertService;
  private intervalId?: NodeJS.Timeout;

  constructor() {
    this.alertService = new AlertService();
  }

  start(intervalMinutes: number = 5): void {
    if (this.intervalId) {
      console.log("Alert scheduler is already running");
      return;
    }

    console.log(
      `Starting alert scheduler with ${intervalMinutes} minute intervals`
    );

    this.intervalId = setInterval(async () => {
      await this.runEvaluation();
    }, intervalMinutes * 60 * 1000);

    this.runEvaluation();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      console.log("Alert scheduler stopped");
    }
  }

  private async runEvaluation(): Promise<void> {
    try {
      console.log("Running alert evaluation...");

      await this.alertService.evaluateAlerts();

      console.log("Alert evaluation completed");
    } catch (error) {
      console.error("Error during alert evaluation:", error);
    }
  }
}
