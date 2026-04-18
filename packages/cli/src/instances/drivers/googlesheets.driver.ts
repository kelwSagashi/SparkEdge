import { Driver } from './driver.interface';
import { google } from 'googleapis';

export interface GoogleSheetsDriverConfig {
  serviceAccountJson: string;
}

export class GoogleSheetsDriver implements Driver {
  private auth?: any;

  constructor(private config: GoogleSheetsDriverConfig) {}

  async connect(): Promise<void> {
    const serviceAccount = JSON.parse(this.config.serviceAccountJson || '{}');
    if (!serviceAccount.client_email) {
      throw new Error('Google service account email missing');
    }
    this.auth = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
      ],
    });
    await this.auth.authorize();
  }

  async disconnect(): Promise<void> {
    // No explicit disconnect needed for googleapis JWT
  }

  getSheets() {
    if (!this.auth) throw new Error('GoogleSheetsDriver not connected');
    return google.sheets({ version: 'v4', auth: this.auth });
  }

  getDrive() {
    if (!this.auth) throw new Error('GoogleSheetsDriver not connected');
    return google.drive({ version: 'v3', auth: this.auth });
  }
}

