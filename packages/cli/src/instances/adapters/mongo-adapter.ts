import { BaseAdapter, CredentialAdapter, AdapterMetadata } from "../adapter-base";
import { MongoDriver } from "../drivers/mongo.driver";
import { MongoServerType } from "../server-types";

@CredentialAdapter()
export class MongoAdapter extends BaseAdapter {
  static readonly metadata: AdapterMetadata = {
    name: "MongoDB",
    strategy: "mongo",
    id: "mongo",
    server_type_id: MongoServerType,
    fields: [
      { key: 'uri', label: 'Connection URI', type: 'text', placeholder: 'mongodb://user:pass@localhost:27017' },
      { key: 'database', label: 'Database Name', type: 'text', placeholder: 'my_database' }
    ],
    resourceFields: [
      { key: 'collection', label: 'Collection Name', type: 'text', placeholder: 'logs' }
    ],
    operationFields: [
      { 
        key: 'operation', 
        label: 'Operation', 
        type: 'select', 
        options: [
          { label: 'Insert One', value: 'insertOne' },
          { label: 'Update One', value: 'updateOne' },
          { label: 'Find', value: 'find' },
          { label: 'Find One', value: 'findOne' }
        ]
      }
    ]
  };

  private driver: MongoDriver;

  constructor(...args: ConstructorParameters<typeof BaseAdapter>) {
    super(...args);
    const { uri, database } = this.credentialData;
    this.driver = new MongoDriver({ uri, dbName: database });
  }

  async send(payload: any) {
    await this.driver.connect();
    try {
      const resourceConfig = this.resource.config as any;
      const collectionName = resourceConfig?.collection || '';
      const collection = this.driver.getCollection(collectionName);
      
      const operationConfig = this.operation.config as any;
      const op = this.operation.type || operationConfig?.operation || 'insertOne';
      
      if (op === 'insertOne') {
        const res = await collection.insertOne(payload);
        return res;
      } else if (op === 'updateOne') {
        const { filter, update } = payload;
        const res = await collection.updateOne(filter || {}, update || { $set: payload }, { upsert: true });
        return res;
      } else if (op === 'find') {
        const res = await collection.find(payload).toArray();
        return res;
      } else if (op === 'findOne') {
        const res = await collection.findOne(payload);
        return res;
      }
      return null;
    } finally {
      await this.driver.disconnect();
    }
  }

  async test() {
    await this.driver.connect();
    const collections = await this.driver.getCollections();
    await this.driver.disconnect();
    return { collections_count: collections.length };
  }

  async discover() {
    await this.driver.connect();
    try {
      const collections = await this.driver.getCollections();
      return collections.map(name => ({
        name,
        type: 'collection',
        config: {
          collection: name
        }
      }));
    } finally {
      await this.driver.disconnect();
    }
  }
}
