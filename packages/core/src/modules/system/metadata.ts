import os from 'os';
import process from 'process';

export interface SystemMetadata {
  os: string;
  os_version: string;
  edge_version: string;
  hardware: string;
  arch: string;
  hostname: string;
}

/**
 * Collects system metadata automatically.
 */
export async function collectSystemMetadata(edgeVersion: string = '0.0.1'): Promise<SystemMetadata> {
  return {
    os: process.platform, // e.g. 'win32', 'linux', 'darwin'
    os_version: os.release(), // e.g. '10.0.19045'
    edge_version: edgeVersion,
    hardware: `${os.type()} ${os.arch()}`, // Basic info if hardware detection is complex
    arch: os.arch(),
    hostname: os.hostname(),
  };
}
