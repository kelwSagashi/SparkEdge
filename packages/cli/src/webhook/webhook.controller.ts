import { Post, RestController } from 'spark-edge-di';
import { InstanceRunnerService } from '../instances/instance-runner.service';
import { InstanceService } from '../instances/instance.service';
import type { Request } from 'express';

@RestController('/webhook')
export class WebhookController {
  constructor(
    private readonly instanceRunner: InstanceRunnerService,
    private readonly instanceService: InstanceService,
  ) {}

  @Post('/:instanceId')
  async receive(req: Request & { params: { instanceId: string } }) {
    const { instanceId } = req.params;
    const instance = await this.instanceService.findById(instanceId);
    if (!instance.data) return { error: 'Instance not found', data: null };

    const triggerType = instance.data.trigger_type;
    if (triggerType !== 'webhook' && triggerType !== 'interval_and_webhook') {
      return { error: 'Instance does not accept webhooks', data: null };
    }

    const config = instance.data.trigger_config as any;
    if (config?.webhook_secret) {
      const secret = req.headers['x-webhook-secret'] || (req.query as any)?.secret;
      if (secret !== config.webhook_secret) {
        return { error: 'Invalid webhook secret', data: null };
      }
    }

    const result = await this.instanceRunner.triggerManual(instanceId);
    return { data: { triggered: true, execution: result } };
  }
}

