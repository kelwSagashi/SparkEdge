import { ServerTypeUpsertValues } from 'spark-edge-db';

export interface ServerTypeMetadata extends ServerTypeUpsertValues {}

export interface ServerTypeConstructor {
  new (): any;
  readonly metadata: ServerTypeMetadata;
}

export class ServerTypeRegistry {
  private static serverTypes = new Map<string, ServerTypeMetadata>();
  private static classToId = new Map<ServerTypeConstructor, string>();

  static register(constructor: ServerTypeConstructor) {
    const metadata = constructor.metadata;
    this.serverTypes.set(metadata.id!, metadata);
    this.classToId.set(constructor, metadata.id!);
  }

  static get(id: string): ServerTypeMetadata | undefined {
    return this.serverTypes.get(id);
  }

  static getByClass(constructor: ServerTypeConstructor): ServerTypeMetadata | null {
    const id = this.classToId.get(constructor);
    return id ? this.get(id) ?? null : null;
  }

  static getAllMetadata(): ServerTypeMetadata[] {
    return Array.from(this.serverTypes.values());
  }

  static async syncWithDatabase() {
    const { dbManager } = await import('spark-edge-db');
    const types = this.getAllMetadata();
    for (const type of types) {
      await dbManager.serverTypes.upsert(type);
      console.log("Server type synced: ", type.id);
    }
  }
}

export function ServerType() {
  return function (constructor: ServerTypeConstructor) {
    ServerTypeRegistry.register(constructor);
  };
}

export abstract class BaseServerType {
  static metadata: ServerTypeMetadata;
}

export function createServerType(metadata: ServerTypeMetadata) {
  return metadata;
}


@ServerType()
export class HttpServerType {
  static readonly metadata: ServerTypeMetadata = {
    id: "http",
    key: "http",
    name: "Servidor HTTP REST",
    description: "Serviços HTTP/REST que podem ser consultados via requisição JSON."
  };
}

@ServerType()
export class PostgresServerType {
  static readonly metadata: ServerTypeMetadata = {
    id: "postgres",
    key: "postgres",
    name: "PostgreSQL",
    description: "Inserção direta em tabelas do banco de dados PostgreSQL."
  };
}

@ServerType()
export class SupabaseServerType {
  static readonly metadata: ServerTypeMetadata = {
    id: "supabase",
    key: "supabase",
    name: "Supabase",
    description: "Integração com Supabase (PostgreSQL + API Auth)."
  };
}

@ServerType()
export class FirebaseServerType {
  static readonly metadata: ServerTypeMetadata = {
    id: "firebase",
    key: "firebase",
    name: "Firebase Firestore",
    description: "Inserção de documentos em coleções do Firestore."
  };
}

@ServerType()
export class GoogleDriveServerType {
  static readonly metadata: ServerTypeMetadata = {
    id: "googledrive",
    key: "googledrive",
    name: "Google Drive",
    description: "Envio de arquivos (ex: CSV) para pastas do Google Drive."
  };
}

@ServerType()
export class GoogleSpreadsheetServerType extends BaseServerType {
  static readonly metadata = createServerType({
    id: "googlespreadsheet",
    key: "googlespreadsheet",
    name: "Google Spreadsheet",
    description: "Adição de linhas em planilhas do Google Sheets."
  });
}

@ServerType()
export class MongoServerType {
  static readonly metadata: ServerTypeMetadata = {
    id: "mongodb",
    key: "mongodb",
    name: "MongoDB",
    description: "Inserção de documentos em coleções do MongoDB."
  };
}

