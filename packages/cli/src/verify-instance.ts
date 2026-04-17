import { dbManager } from 'nmg8-db';

async function verify() {
  const instanceId = 'Guq12FHdgmvsx61O3NY-h';
  console.log('--- VERIFYING INSTANCE ---');
  
  const instance = dbManager.instances.findById(instanceId);
  console.log('Instance:', JSON.stringify(instance.data, null, 2));

  const destinations = dbManager.instanceDestinations.listByInstance(instanceId);
  console.log('Destinations count:', destinations.data?.length ?? 0);
  console.log('Destinations:', JSON.stringify(destinations.data, null, 2));

  if (destinations.data) {
    for (const dest of destinations.data) {
      const mapping = dbManager.dataMappings.getByInstanceDestination(dest.id);
      console.log(`Mapping for destination ${dest.id}:`, JSON.stringify(mapping.data, null, 2));
    }
  }
}

verify().catch(console.error);
