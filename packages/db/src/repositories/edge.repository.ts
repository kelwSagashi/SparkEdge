import type { DBType } from "../db";
import { Tables } from "../db";
import { eq, lt } from 'drizzle-orm';
import type { 
  ReturningQueries,
  EdgeIdentityUpsertValues,
  EdgeIdentityReturningValues,
  EdgeCredentialsUpsertValues,
  EdgeCredentialsReturningValues,
  MqttCommandUpsertValues,
  MqttCommandReturningValues,
  MqttQueueUpsertValues,
  MqttQueueReturningValues,
  EdgeConfigUpsertValues,
  EdgeConfigReturningValues
} from '../types';

export class EdgeRepository {
  constructor(private db: DBType) {}

  // ─── Identity ───────────────────────────────────────────────────────────────

  getIdentity(): ReturningQueries<EdgeIdentityReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.EdgeIdentityTable).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsertIdentity(values: EdgeIdentityUpsertValues): ReturningQueries<EdgeIdentityReturningValues | null> {
    try {
      // Clear existing to ensure singleton nature even if previous logic failed
      // This is a safety measure to prevent multiple identities in the table
      const existing = this.db.select().from(Tables.EdgeIdentityTable).get();
      
      let data;
      if (existing) {
        data = this.db.update(Tables.EdgeIdentityTable)
          .set({ 
            ...values, 
            created_at: undefined,
            id: undefined // Never update the primary key
          })
          .where(eq(Tables.EdgeIdentityTable.id, existing.id))
          .returning()
          .get();
      } else {
        data = this.db.insert(Tables.EdgeIdentityTable)
          .values(values)
          .returning()
          .get();
      }

      if (!data) {
        throw new Error("Failed to upsert identity - result was empty");
      }

      return { data };
    } catch (error: unknown) {
      console.error("[EdgeRepository] upsertIdentity error:", error);
      return { error, data: null };
    }
  }

  clearIdentity(): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.EdgeIdentityTable).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  // ─── MQTT Credentials ──────────────────────────────────────────────────────

  getMqttCredentials(): ReturningQueries<EdgeCredentialsReturningValues | null> {
    try {
      const data = this.db.select()
        .from(Tables.EdgeCredentialsTable)
        .where(eq(Tables.EdgeCredentialsTable.type, 'mqtt'))
        .get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsertMqttCredentials(values: EdgeCredentialsUpsertValues): ReturningQueries<EdgeCredentialsReturningValues | null> {
    try {
      const existing = this.db.select()
        .from(Tables.EdgeCredentialsTable)
        .where(eq(Tables.EdgeCredentialsTable.type, 'mqtt'))
        .get();
      
      let data;
      if (existing) {
        data = this.db.update(Tables.EdgeCredentialsTable)
          .set({ ...values, updated_at: new Date().toISOString() })
          .where(eq(Tables.EdgeCredentialsTable.id, existing.id))
          .returning()
          .get();
      } else {
        data = this.db.insert(Tables.EdgeCredentialsTable)
          .values({ ...values, type: 'mqtt' })
          .returning()
          .get();
      }
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  clearMqttCredentials(): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.EdgeCredentialsTable)
        .where(eq(Tables.EdgeCredentialsTable.type, 'mqtt'))
        .run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  // ─── MQTT Queue ───────────────────────────────────────────────────────────

  enqueue(item: MqttQueueUpsertValues): ReturningQueries<MqttQueueReturningValues | null> {
    try {
      const data = this.db.insert(Tables.MqttQueueTable)
        .values(item)
        .returning()
        .get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listQueue(maxAttempts: number): ReturningQueries<MqttQueueReturningValues[]> {
    try {
      const data = this.db.select()
        .from(Tables.MqttQueueTable)
        .where(lt(Tables.MqttQueueTable.attempts, maxAttempts))
        .all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  deleteQueueItem(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.MqttQueueTable)
        .where(eq(Tables.MqttQueueTable.id, id))
        .run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  incrementQueueAttempt(id: string): ReturningQueries<unknown> {
    try {
      const existing = this.db.select()
        .from(Tables.MqttQueueTable)
        .where(eq(Tables.MqttQueueTable.id, id))
        .get();
      
      if (!existing) return { data: null };

      const data = this.db.update(Tables.MqttQueueTable)
        .set({ 
          attempts: (existing.attempts || 0) + 1,
          last_attempt_at: new Date().toISOString()
        })
        .where(eq(Tables.MqttQueueTable.id, id))
        .run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  // ─── MQTT Commands ────────────────────────────────────────────────────────

  getCommandById(commandId: string): ReturningQueries<MqttCommandReturningValues | null> {
    try {
      const data = this.db.select()
        .from(Tables.MqttCommandsTable)
        .where(eq(Tables.MqttCommandsTable.command_id, commandId))
        .get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  saveCommand(item: MqttCommandUpsertValues): ReturningQueries<MqttCommandReturningValues | null> {
    try {
      const data = this.db.insert(Tables.MqttCommandsTable)
        .values({
          ...item,
          status: item.status || 'pending',
          created_at: new Date().toISOString()
        })
        .returning()
        .get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  updateCommandStatus(commandId: string, status: any, result?: any, error?: string): ReturningQueries<MqttCommandReturningValues | null> {
    try {
      const updateData: any = { status };
      
      if (status === 'running') {
        updateData.started_at = new Date().toISOString();
      } else {
        updateData.finished_at = new Date().toISOString();
      }

      if (error) updateData.error = error;
      if (result) updateData.result = result;

      const data = this.db.update(Tables.MqttCommandsTable)
        .set(updateData)
        .where(eq(Tables.MqttCommandsTable.command_id, commandId))
        .returning()
        .get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  // ─── Edge Config ─────────────────────────────────────────────────────────

  getEdgeConfig(): ReturningQueries<EdgeConfigReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.EdgeConfigTable).limit(1).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsertEdgeConfig(values: EdgeConfigUpsertValues): ReturningQueries<EdgeConfigReturningValues | null> {
    try {
      const existing = this.db.select().from(Tables.EdgeConfigTable).limit(1).get();
      let data;
      if (existing) {
        data = this.db.update(Tables.EdgeConfigTable)
          .set({ ...values, updated_at: new Date().toISOString() })
          .where(eq(Tables.EdgeConfigTable.id, existing.id))
          .returning()
          .get() ?? null;
      } else {
        data = this.db.insert(Tables.EdgeConfigTable)
          .values(values)
          .returning()
          .get() ?? null;
      }
      return { data };
    } catch (error: unknown) {
      console.error('[EdgeRepository] upsertEdgeConfig error:', error);
      return { error, data: null };
    }
  }

  clearEdgeConfig(): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.EdgeConfigTable).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default EdgeRepository;
