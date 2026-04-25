import { Post, RestController } from '@spark-edge/di';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * /api/spark-cloud/* — Simulation of Spark Cloud behavior
 *
 * This is used to test the provisioning flow:
 * Edge -> Connect -> Cloud creates identity -> Returns credentials -> Edge saves.
 */
@RestController('/spark-cloud')
export class SparkCloudController {

  /** 
   * POST /api/spark-cloud/auth/login — Simulate cloud login
   * Returns a dummy token.
   */
  @Post('/auth/login')
  async login(_req: Request, res: Response) {
    return res.json({
      token: 'mock-cloud-token-' + uuidv4(),
    });
  }

  /**
   * POST /api/spark-cloud/edges/register — Simulate edge registration
   * Generates a new edge_id and MQTT credentials.
   */
  @Post('/edges/register')
  async register(req: Request, res: Response) {
    const { name, lat, lng, tags } = req.body ?? {};
    
    console.log(`[CloudSimulator] New Edge registration request:`);
    console.log(`  - Name: ${name}`);
    console.log(`  - Location: ${lat}, ${lng}`);
    console.log(`  - Tags: ${tags?.join(', ') || 'none'}`);

    const newEdgeId = `edge-${uuidv4().substring(0, 8)}`;

    return res.json({
      edge_id: newEdgeId,
      edge_name: name || `Edge ${newEdgeId}`,
      mqtt: {
        url: process.env.MQTT_URL || 'mqtt://localhost:1883',
        username: `spark-user-${newEdgeId}`,
        password: `spark-pass-${uuidv4().substring(0, 8)}`,
      }
    });
  }
}
