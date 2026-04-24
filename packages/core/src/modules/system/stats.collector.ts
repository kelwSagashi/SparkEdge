import os from 'os';
import { execSync } from 'child_process';

/**
 * System Statistics Collector for SparkEdge.
 * Collects real-time metrics including CPU, RAM, Disk, and Uptime.
 */

export interface SystemStats {
  timestamp: string;
  cpu: number;
  memory: number;
  uptime: number;
  disk: number;
  network: {
    latency: number | null;
  };
}

let lastCpuUsage = os.cpus();

/**
 * Collects current system statistics using Node.js internal APIs and OS commands.
 */
export function collectSystemStats(): SystemStats {
  // 1. Memory Usage
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

  // 2. CPU Usage (Average across all cores)
  const currentCpuUsage = os.cpus();
  
  let totalDiff = 0;
  let idleDiff = 0;

  for (let i = 0; i < currentCpuUsage.length; i++) {
    const last = lastCpuUsage[i].times;
    const curr = currentCpuUsage[i].times;

    const lastTotal = last.user + last.nice + last.sys + last.idle + last.irq;
    const currTotal = curr.user + curr.nice + curr.sys + curr.idle + curr.irq;

    totalDiff += currTotal - lastTotal;
    idleDiff += curr.idle - last.idle;
  }

  const cpuUsage = totalDiff > 0 ? (1 - idleDiff / totalDiff) * 100 : 0;
  lastCpuUsage = currentCpuUsage;

  // 3. Disk Usage
  let diskUsage = 0;
  try {
    if (process.platform === 'win32') {
      // Windows: Use wmic to get logical disk info
      const output = execSync('wmic logicaldisk where "DeviceID=\'C:\'" get size,freespace').toString();
      const parts = output.split(/\s+/).filter(p => !isNaN(Number(p)) && p !== '');
      if (parts.length >= 2) {
        const free = parseInt(parts[0]);
        const size = parseInt(parts[1]);
        diskUsage = ((size - free) / size) * 100;
      }
    } else {
      // Linux/Mac: Use df
      const output = execSync("df / | tail -1 | awk '{print $5}'").toString();
      diskUsage = parseInt(output.replace('%', ''));
    }
  } catch (err) {
    console.warn('[StatsCollector] Could not determine disk usage:', err);
  }

  // 4. Uptime
  const uptime = Math.floor(os.uptime());

  return {
    timestamp: new Date().toISOString(),
    cpu: Number(cpuUsage.toFixed(2)),
    memory: Number(memoryUsage.toFixed(2)),
    uptime,
    disk: Number(diskUsage.toFixed(2)),
    network: {
      latency: null // Default null, can be expanded later
    }
  };
}
