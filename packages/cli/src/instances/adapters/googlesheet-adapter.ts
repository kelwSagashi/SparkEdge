import { BaseAdapter, CredentialAdapter, AdapterMetadata } from "../adapter-base";
import { GoogleSheetsDriver } from "../drivers/googlesheets.driver";
import { GoogleSpreadsheetServerType } from "../server-types";

@CredentialAdapter()
export class GoogleSheetsAdapter extends BaseAdapter {
  static readonly metadata: AdapterMetadata = {
    name: "Google Spreadsheet",
    strategy: "googlespreadsheet",
    id: "googlespreadsheet", 
    server_type_id: GoogleSpreadsheetServerType,
    fields: [
       { key: 'serviceAccountJson', label: 'Service Account JSON', type: 'textarea', placeholder: '{ ... }' }
    ],
    resourceFields: [
       { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: '1abc...' }
    ],
    operationFields: [
       { key: 'range', label: 'Range (Sheet Name)', type: 'text', placeholder: 'Sheet1!A1' },
       { key: 'action', label: 'Action', type: 'select', options: [
           { label: 'Append', value: 'append' },
           { label: 'Update', value: 'update' }
       ]}
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
    const sheets = this.driver.getSheets();
    const resourceConfig = this.resource.config as any;
    const { spreadsheetId } = resourceConfig;
    
    const operationConfig = this.operation.config as any;
    const { range, action } = operationConfig;

    const values = [Object.values(payload)];
    
    if (action === 'update') {
      const res =  await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: range || 'Sheet1!A1',
        valueInputOption: 'RAW',
        requestBody: { values },
      });

      return res.json().catch(() => ({}))
    } else {
      const res = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: range || 'Sheet1!A1',
        valueInputOption: 'RAW',
        requestBody: { values },
      });
      return res.json().catch(() => ({}))
    }
  }

  async test() {
    await this.driver.connect();
    const sheets = this.driver.getSheets();
    const { spreadsheetId } = this.resource.config;
    if (spreadsheetId) {
      const res = await sheets.spreadsheets.get({ spreadsheetId });
      return res.json().catch(() => ({}))
    }
    return null;
  }
}
