import { BaseAdapter, CredentialAdapter, AdapterMetadata } from "../adapter-base";
import { GoogleSheetsDriver } from "../drivers/googlesheets.driver";
import { Readable } from 'stream';
import { GoogleDriveServerType } from "../server-types";

@CredentialAdapter()
export class GoogleDriveAdapter extends BaseAdapter {
  static readonly metadata: AdapterMetadata = {
    name: "Google Drive",
    strategy: "googledrive",
    id: "googledrive",
    server_type_id: GoogleDriveServerType,
    fields: [
       { key: 'serviceAccountJson', label: 'Service Account JSON', type: 'textarea', placeholder: '{ ... }' }
    ],
    resourceFields: [
       { key: 'folderId', label: 'Folder ID', type: 'text', placeholder: '1abc...' }
    ],
    operationFields: [
       { key: 'fileName', label: 'File Name', type: 'text', placeholder: 'data.json' }
    ]
  };

  private driver: GoogleSheetsDriver;

  constructor(...args: ConstructorParameters<typeof BaseAdapter>) {
    super(...args);
    const { serviceAccountJson } = this.credentialData;
    this.driver = new GoogleSheetsDriver({ serviceAccountJson });
  }

  async send(payload: any) {
    await this.driver.connect();
    const drive = this.driver.getDrive();
    const resourceConfig = this.resource.config as any;
    const { folderId } = resourceConfig;
    
    const operationConfig = this.operation.config as any;
    const { fileName } = operationConfig;

    const stream = new Readable();
    stream.push(JSON.stringify(payload, null, 2));
    stream.push(null);

    const res = await drive.files.create({
      requestBody: {
        name: fileName || `export_${Date.now()}.json`,
        parents: folderId ? [folderId] : undefined,
      },
      media: {
        mimeType: 'application/json',
        body: stream,
      },
    });

    return res.json().catch(() => ({}))
  }

  async test() {
    await this.driver.connect();
    const drive = this.driver.getDrive();
    const res = await drive.files.list({ pageSize: 1 });
    return res.json().catch(() => ({}))
  }
}

