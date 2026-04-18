import { BaseAdapter, CredentialAdapter, AdapterMetadata } from "../adapter-base";
import { FirebaseDriver } from "../drivers/firebase.driver";
import { FirebaseServerType } from "../server-types";

@CredentialAdapter()
export class FirebaseAdapter extends BaseAdapter {
  static readonly metadata: AdapterMetadata = {
    name: "Firebase (Firestore)",
    strategy: "firebase",
    id: "firebase",
    server_type_id: FirebaseServerType,
    fields: [
      { key: 'projectId', label: 'Project ID', type: 'text' },
      { key: 'clientEmail', label: 'Client Email', type: 'text' },
      { key: 'privateKey', label: 'Private Key', type: 'textarea' }
    ],
    resourceFields: [
      { key: 'collection', label: 'Collection Name', type: 'text', placeholder: 'sensors' }
    ],
    operationFields: [
      { 
        key: 'operation', 
        label: 'Operation', 
        type: 'select', 
        options: [
          { label: 'Add Document', value: 'add' },
          { label: 'Set Document', value: 'set' }
        ]
      },
      { key: 'docId', label: 'Document ID (optional)', type: 'text' }
    ]
  };

  private driver: FirebaseDriver;

  constructor(...args: ConstructorParameters<typeof BaseAdapter>) {
    super(...args);
    const { projectId, clientEmail, privateKey } = this.credentialData;
    this.driver = new FirebaseDriver({ projectId, clientEmail, privateKey });
  }

  async send(payload: any) {
    await this.driver.connect();
    const firestore = this.driver.getFirestore();
    const resourceConfig = this.resource.config as any;
    const collectionName = resourceConfig?.collection || '';
    
    const operationConfig = this.operation.config as any;
    const op = operationConfig?.operation || 'add';
    const docId = operationConfig?.docId || payload.id;

    const collection = firestore.collection(collectionName);

    if (op === 'set' && docId) {
      return await collection.doc(docId).set(payload);
    } else {
      return await collection.add(payload);
    }

    
  }

  async test() {
    await this.driver.connect();
    const firestore = this.driver.getFirestore();
    return await firestore.listCollections();
  }
}
