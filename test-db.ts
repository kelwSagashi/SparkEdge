import { dbManager } from './packages/db/src/services/db.service';
import { v4 as uuidv4 } from 'uuid';

async function testIdentity() {
  console.log('--- DB Identity Test ---');
  
  const id1 = dbManager.edge.getIdentity();
  console.log('Initial Identity:', id1.data);

  if (!id1.data) {
    const newId = `test-edge-${uuidv4()}`;
    console.log('Inserting new ID:', newId);
    const upsert = dbManager.edge.upsertIdentity({ 
      edge_id: newId, 
      provisioned: 0 
    });
    console.log('Upsert result:', upsert.data);

    const id2 = dbManager.edge.getIdentity();
    console.log('Identity after insert:', id2.data);
  } else {
    console.log('Identity already exists.');
  }
}

testIdentity().catch(console.error);
