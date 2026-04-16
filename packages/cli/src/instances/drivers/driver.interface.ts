export interface Driver {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export interface DriverConstructor<T = any> {
  new (config: T): Driver;
}
