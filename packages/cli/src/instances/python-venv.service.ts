import { Service } from '@nmg8/di';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { Logger } from '@/simple-logger';

/**
 * Manages isolated Python virtual environments for scripts.
 * Each downloaded script gets its own venv to avoid dependency conflicts.
 */
@Service()
export class PythonVenvService {
  private readonly baseVenvDir: string;

  constructor(private readonly logger: Logger) {
    this.baseVenvDir = path.resolve(process.cwd(), '.nmg8', 'venvs');
    if (!fs.existsSync(this.baseVenvDir)) {
      fs.mkdirSync(this.baseVenvDir, { recursive: true });
    }
  }

  /**
   * Create a venv for a script and install its requirements.
   */
  async createVenv(scriptId: string, scriptDir: string): Promise<{ success: boolean; venvPath: string; error?: string }> {
    const venvPath = path.join(this.baseVenvDir, scriptId);

    // Create venv
    try {
      await this.runCommand('python', ['-m', 'venv', venvPath]);
      this.logger.log(`[PythonVenv] Created venv at ${venvPath}`);
    } catch (error: any) {
      // On some systems 'python3' is needed
      try {
        await this.runCommand('python3', ['-m', 'venv', venvPath]);
        this.logger.log(`[PythonVenv] Created venv at ${venvPath} (python3)`);
      } catch (error2: any) {
        return { success: false, venvPath, error: `Failed to create venv: ${error2.message}` };
      }
    }

    // Install requirements if present
    const requirementsPath = path.join(scriptDir, 'requirements.txt');
    if (fs.existsSync(requirementsPath)) {
      try {
        const pipPath = this.getPipPath(venvPath);
        await this.runCommand(pipPath, ['install', '-r', requirementsPath]);
        this.logger.log(`[PythonVenv] Installed requirements for script ${scriptId}`);
      } catch (error: any) {
        return { success: false, venvPath, error: `Failed to install requirements: ${error.message}` };
      }
    }

    return { success: true, venvPath };
  }

  /**
   * Execute a Python script inside its isolated venv.
   */
  async executeScript(
    venvPath: string,
    scriptPath: string,
    args: string[] = [],
    timeoutMs = 60_000
  ): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
    const pythonPath = this.getPythonPath(venvPath);

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';

      const proc = spawn(pythonPath, [scriptPath, ...args], {
        timeout: timeoutMs,
        env: {
          ...process.env,
          VIRTUAL_ENV: venvPath,
          PATH: `${path.join(venvPath, process.platform === 'win32' ? 'Scripts' : 'bin')}${path.delimiter}${process.env.PATH}`,
        },
      });

      proc.stdout.on('data', (data) => { stdout += data.toString(); });
      proc.stderr.on('data', (data) => { stderr += data.toString(); });

      proc.on('close', (code) => {
        resolve({ stdout, stderr, exitCode: code });
      });

      proc.on('error', (err) => {
        resolve({ stdout, stderr: stderr + err.message, exitCode: -1 });
      });
    });
  }

  /**
   * Remove a venv directory.
   */
  async removeVenv(scriptId: string): Promise<void> {
    const venvPath = path.join(this.baseVenvDir, scriptId);
    if (fs.existsSync(venvPath)) {
      fs.rmSync(venvPath, { recursive: true, force: true });
      this.logger.log(`[PythonVenv] Removed venv for script ${scriptId}`);
    }
  }

  /**
   * Check if a venv exists and is usable.
   */
  venvExists(scriptId: string): boolean {
    const pythonPath = this.getPythonPath(path.join(this.baseVenvDir, scriptId));
    return fs.existsSync(pythonPath);
  }

  private getPythonPath(venvPath: string): string {
    return process.platform === 'win32'
      ? path.join(venvPath, 'Scripts', 'python.exe')
      : path.join(venvPath, 'bin', 'python');
  }

  private getPipPath(venvPath: string): string {
    return process.platform === 'win32'
      ? path.join(venvPath, 'Scripts', 'pip.exe')
      : path.join(venvPath, 'bin', 'pip');
  }

  private runCommand(command: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, { stdio: 'pipe' });
      let stderr = '';
      proc.stderr.on('data', (d) => { stderr += d.toString(); });
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Command "${command} ${args.join(' ')}" exited with code ${code}: ${stderr}`));
      });
      proc.on('error', reject);
    });
  }
}

export default PythonVenvService;
