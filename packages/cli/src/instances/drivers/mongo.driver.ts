import { Driver } from './driver.interface';
import { MongoClient, type Db, type Collection, type Document } from 'mongodb';

export interface MongoDriverConfig {
  uri: string;
  dbName: string;
}

export class MongoDriver implements Driver {
  private client: MongoClient;
  private db?: Db;

  constructor(private config: MongoDriverConfig) {
    this.client = new MongoClient(config.uri);
  }

  async connect(): Promise<void> {
    await this.client.connect();
    this.db = this.client.db(this.config.dbName);
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  getCollection<T extends Document = Document>(name: string): Collection<T> {
    if (!this.db) throw new Error('MongoDriver not connected');
    return this.db.collection<T>(name);
  }

  async getCollections(): Promise<string[]> {
    if (!this.db) throw new Error('MongoDriver not connected');
    const collections = await this.db.listCollections().toArray();
    return collections.map(c => c.name);
  }
}
