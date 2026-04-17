import 'reflect-metadata';
import { Container } from '@nmg8/di';
import InstanceRunnerService from './instances/instance-runner.service';
import { TemplateResolver } from './instances/template-resolver';
import { Logger } from './simple-logger';
import { PythonVenvService } from './instances/python-venv.service';
import { FallbackQueueService } from './instances/fallback-queue.service';

async function testMapping() {
  console.log('--- TESTING MAPPING RESOLUTION ---');
  
  const logger = Container.get(Logger);
  const venvService = Container.get(PythonVenvService);
  const fallbackQueue = Container.get(FallbackQueueService);
  const runner = new InstanceRunnerService(venvService, fallbackQueue, logger);

  const mockSourceJson = {
    teste: 123,
    status: 'ok',
    nested: {
        val: 'inner'
    }
  };

  const mockPayloadTemplate = {
    name: 'Device {{device.id}}',
    output_val: 'Value is {{teste}}',
    nested_val: 'Nested is {{nested.val}}',
    exec: 'Execution {{execution_id}}'
  };

  const mockContext = {
    execution_id: 'EXEC-123',
    device: { id: 'DEV-456', name: 'MyDevice' },
    script: { id: 'SCR-789' },
    instance: { id: 'INST-000' },
    timestamp: new Date().toISOString()
  };

  const mockMappingConfig = {
    "mapped_field": "{{status}}"
  };

  // @ts-ignore - accessing private method for testing
  const result = runner.applyMapping(
    mockMappingConfig,
    mockSourceJson,
    mockPayloadTemplate,
    [],
    '',
    mockContext as any
  );

  console.log('Resolved Payload:');
  console.log(JSON.stringify(result, null, 2));

  // Assertions (manual for now)
  const expected = {
    name: 'Device DEV-456',
    output_val: 'Value is 123',
    nested_val: 'Nested is inner',
    exec: 'Execution EXEC-123',
    mapped_field: 'ok'
  };

  const success = JSON.stringify(result) === JSON.stringify(expected);
  if (success) {
    console.log('SUCCESS: Mapping resolved correctly!');
  } else {
    console.error('FAILURE: Mapping resolution failed!');
    console.log('Expected:', JSON.stringify(expected, null, 2));
  }
}

testMapping().catch(console.error);
