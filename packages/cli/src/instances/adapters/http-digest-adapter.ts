import { BaseAdapter, CredentialAdapter } from "../adapter-base";
import { HttpServerType } from "../server-types";

@CredentialAdapter()
export class HttpDigestAdapter extends BaseAdapter {
  static readonly metadata = {
    name: "Digest Auth",
    strategy: "http_digest",
    id: "digest_auth",
    server_type_id: HttpServerType,
    fields: [
      { key: 'base_url', label: 'URL', type: 'text', placeholder: 'http://localhost:3000' },
      { key: 'username', label: 'Username', type: 'text', grid: 'col-span-1' },
      { key: 'password', label: 'Password', type: 'password', grid: 'col-span-1' }
    ],
  };

  async send() {
    throw new Error("Digest Auth not fully implemented yet");
  }
  async test() {
    const { username, password, base_url } = this.credentialData;
    const url = base_url;
    if (!url) throw new Error('Base URL required for test');
    await fetch(url);
  }
}