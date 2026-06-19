import 'reflect-metadata';
import { Container } from 'spark-edge-di';
import InstanceRunnerService from './instances/instance-runner.service';
import { dbManager } from 'spark-edge-db';
import { Logger } from './simple-logger';
import { PythonVenvService } from './instances/python-venv.service';
import { FallbackQueueService } from './instances/fallback-queue.service';

async function test() {
  const instanceId = '10QrCLUp-1Yz5uKkgC5Pl'; // The instance with {{device.id}}
  console.log(`--- TESTING EXECUTION FOR INSTANCE ${instanceId} ---`);

  // Manually instantiate dependencies if DI fails
  const logger = Container.get(Logger);
  const venvService = Container.get(PythonVenvService);
  const fallbackQueue = Container.get(FallbackQueueService);
  
  const runner = new InstanceRunnerService(venvService, fallbackQueue, logger);
  
  // 1. Check instance data before
  const instanceRes = dbManager.instances.findById(instanceId);
  if (!instanceRes.data) {
    console.error('Instance not found in DB');
    return;
  }
  
  console.log('Original Parameters:', JSON.stringify(instanceRes.data.script_parameters, null, 2));

  // 2. Trigger execution
  console.log('Starting execution...');
  const result = await runner.executeInstance(instanceRes.data, 'manual');
  
  console.log('--- EXECUTION RESULT ---');
  console.log('Status:', result.status);
  if (result.error) {
    console.error('Error:', result.error);
  }
  if (result.output) {
    console.log('Output:', result.output);
  }

  // 3. Check the execution record in DB
  const latestExec = dbManager.instanceExecutions.listByInstance(instanceId);
  const last = latestExec.data?.[0];
  if (last) {
    console.log('Latest Execution ID:', last.id);
    console.log('Latest Execution Status:', last.status);
    console.log('Latest Execution Error:', last.error_message);
  }
}

test().catch(console.error);

