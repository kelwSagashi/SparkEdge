import { Service } from '@nmg8/di';
import { dbManager } from 'nmg8-db';
import { InstanceRunnerService } from './instance-runner.service';
import { Logger } from '@/simple-logger';

@Service()
export class InstanceSchedulerService {
  private pollingIntervalMs = 30 * 1000; // Check every 30 seconds
  private timer: ReturnType<typeof setInterval> | null = null;
  private isProcessing = false;

  constructor(
    private readonly instanceRunner: InstanceRunnerService,
    private readonly logger: Logger
  ) {}

  /**
   * Start the scheduler polling loop.
   */
  public start(): void {
    if (this.timer) return;
    
    this.logger.log('[InstanceScheduler] Starting interval-based scheduler...');
    this.timer = setInterval(() => this.poll(), this.pollingIntervalMs);
    
    // Run an initial poll immediately
    this.poll();
  }

  /**
   * Stop the scheduler polling loop.
   */
  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.logger.log('[InstanceScheduler] Scheduler stopped.');
    }
  }

  /**
   * Poll for instances that need execution.
   */
  private async poll(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const activeRes = dbManager.instances.listActive();
      if (activeRes.error || !activeRes.data) return;

      const now = new Date();
      const intervalInstances = activeRes.data.filter(inst => {
        if (inst.trigger_type !== 'interval') return false;
        // Only trigger if not already running
        if (inst.status === 'running') return false; 
        
        const config = inst.trigger_config as any;
        const intervalSeconds = config?.interval_seconds || 300;
        
        // Find last execution
        const lastExecRes = dbManager.instanceExecutions.listByInstance(inst.id, 1);
        const lastExec = lastExecRes.data?.[0];
        
        if (!lastExec) return true; // Never run before, run now
        
        const lastRun = new Date(lastExec.started_at || lastExec.created_at);
        const elapsedSeconds = (now.getTime() - lastRun.getTime()) / 1000;
        
        return elapsedSeconds >= intervalSeconds;
      });

      if (intervalInstances.length > 0) {
        this.logger.log(`[InstanceScheduler] Found ${intervalInstances.length} instances due for execution.`);
        
        // Run in parallel
        await Promise.all(intervalInstances.map(inst => {
          this.logger.log(`[InstanceScheduler] Triggering execution for ${inst.name} (${inst.id})`);
          return this.instanceRunner.executeInstance(inst, 'interval');
        }));
      }
    } catch (err) {
      this.logger.log(`[InstanceScheduler] Error during polling: ${err}`);
    } finally {
      this.isProcessing = false;
    }
  }
}

export default InstanceSchedulerService;
