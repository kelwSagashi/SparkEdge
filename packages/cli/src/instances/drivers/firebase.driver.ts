import { Driver } from './driver.interface';
import admin from 'firebase-admin';

export interface FirebaseDriverConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

export class FirebaseDriver implements Driver {
  private app?: admin.app.App;

  constructor(private config: FirebaseDriverConfig) {}

  async connect(): Promise<void> {
    if (!admin.apps.length) {
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.config.projectId,
          clientEmail: this.config.clientEmail,
          privateKey: this.config.privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      this.app = admin.app();
    }
  }

  async disconnect(): Promise<void> {
    // Firebase Admin apps stay persistent usually, but we could deleteApp if needed
  }

  getFirestore(): admin.firestore.Firestore {
    return admin.firestore();
  }
}

