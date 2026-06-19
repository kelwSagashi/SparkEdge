import { Get, Post, RestController } from 'spark-edge-di';
import { AdapterRegistry } from './adapter-base';
import { DestinationFactory } from './destination-adapters';
import { Logger } from '@/simple-logger';

@RestController('/adapters')
export class AdaptersController {
  
  @Get('/metadata')
  async getMetadata() {
    return AdapterRegistry.getAllMetadata();
  }

  @Post('/:id/discover')
  async discover(request: { params: { id: string }, body: { credentials: any } }) {
    const logger = new Logger();
    try {
      const adapter = DestinationFactory.create(
        { type: request.params.id } as any, // server
        {} as any, // resource
        { type: 'discover' } as any, // operation
        { data: request.body.credentials } as any, // credentials
        logger
      );

      const resources = await adapter.discover();
      return { success: true, resources };
    } catch (error: any) {
      console.error('Discovery failure:', error);
      return { success: false, error: error.message };
    }
  }
}

export default AdaptersController;

