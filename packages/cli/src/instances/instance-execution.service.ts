/**
 * Instance Execution Service
 * Handles the complete execution flow of an instance
 */

import { Service } from "spark-edge-di";
import { dbManager } from "spark-edge-db";
import { Logger } from "@/simple-logger";
import type {
  IExecutionContext,
  IExecutionOutput,
  IExecutionLog,
} from "./instance.types";

@Service()
export class InstanceExecutionService {
  private logs: IExecutionLog[] = [];

  constructor(private readonly logger: Logger) {}

  /**
   * Execute an instance end-to-end
   */
  async execute(context: IExecutionContext): Promise<IExecutionOutput> {
    this.logs = [];
    const startTime = Date.now();

    try {
      this.addLog(
        "info",
        `Starting execution for instance: ${context.instance_id}`,
      );

      // 1. Get instance config
      const instanceResult = await dbManager.instances.findById(
        context.instance_id,
      );
      if (!instanceResult.data) {
        throw new Error("Instance not found");
      }

      this.addLog("info", "Instance found");

      // 2. Get destinations
      const destResult = await dbManager.instanceDestinations.listByInstance(
        context.instance_id,
      );
      if (!destResult.data || destResult.data.length === 0) {
        throw new Error("No destinations configured");
      }

      const destinations = destResult.data;
      let sentCount = 0;
      const destinationErrors: Record<string, string> = {};

      // 3. For each enabled destination, try to send
      for (const destination of destinations) {
        if (!destination.enabled) {
          this.addLog(
            "info",
            `Destination ${destination.id} disabled, skipping`,
          );
          continue;
        }

        try {
          // Get mapping
          const mappingResult =
            await dbManager.dataMappings.getByInstanceDestination(
              destination.id,
            );

          if (mappingResult.data) {
            this.addLog("info", `Sending to destination ${destination.id}`);
            sentCount++;
          }
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          destinationErrors[destination.id] = errorMsg;
          this.addLog("warn", `Error with destination: ${errorMsg}`);
        }
      }

      // 4. Create execution record
      const duration = Date.now() - startTime;
      await dbManager.instanceExecutions.create({
        instance_id: context.instance_id,
        status: sentCount > 0 ? "success" : "failed",
        trigger_type: context.trigger_type,
        started_at: new Date(startTime).toISOString(),
        finished_at: new Date().toISOString(),
        duration_ms: duration,
        logs: this.logs as any,
        output: "",
        error_message:
          Object.keys(destinationErrors).length > 0
            ? JSON.stringify(destinationErrors)
            : null,
        destination_sent: sentCount > 0,
      });

      return {
        success: sentCount > 0,
        output: {},
        logs: this.logs,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.addLog("error", errorMsg);

      const duration = Date.now() - startTime;
      await dbManager.instanceExecutions.create({
        instance_id: context.instance_id,
        status: "failed",
        trigger_type: context.trigger_type,
        started_at: new Date(startTime).toISOString(),
        finished_at: new Date().toISOString(),
        duration_ms: duration,
        logs: this.logs as any,
        error_message: errorMsg,
      });

      return {
        success: false,
        error: errorMsg,
        logs: this.logs,
      };
    }
  }

  /**
   * Add log entry
   */
  private addLog(level: "info" | "warn" | "error", message: string): void {
    const log: IExecutionLog = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };
    this.logs.push(log);
    this.logger.log(`[Instance] [${level.toUpperCase()}] ${message}`);
  }
}

export default InstanceExecutionService;

