import os from 'os';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';

const execAsync = promisify(exec);

export const SCRIPTS_STORAGE_DIR = path.join(os.homedir(), '.spark_edge', 'scripts');

/**
 * Resolves a path that might be relative to the home directory.
 * If the path starts with '.spark_edge', it is joined with the home directory.
 */
export function resolveHomePath(p: string | null | undefined): string | null {
    if (!p) return null;
    if (p.startsWith('.spark_edge')) {
        return path.join(os.homedir(), p);
    }
    return p;
}

/**
 * Converts an absolute path to a relative path starting with '.spark_edge' 
 * if it is inside the home directory.
 */
export function toRelativePath(p: string | null | undefined): string | null {
    if (!p) return null;
    const home = os.homedir();
    if (p.startsWith(home)) {
        // Remove home prefix and any leading separator
        let relative = p.slice(home.length);
        if (relative.startsWith(path.sep)) {
            relative = relative.slice(1);
        }
        return relative;
    }
    return p;
}

export async function ensureScriptsStorageDir() {
    if (!fs.existsSync(SCRIPTS_STORAGE_DIR)) {
        fs.mkdirSync(SCRIPTS_STORAGE_DIR, { recursive: true });
    }
}

export async function extractZipToTemp(zipFilePath: string): Promise<{ tempFolder: string, pyFiles: string[], hasSparkit: boolean }> {
    const tempFolder = path.join(os.tmpdir(), `spark_edge_script_${crypto.randomUUID()}`);
    fs.mkdirSync(tempFolder, { recursive: true });

    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(tempFolder, true);

    const pyFiles: string[] = [];
    let hasSparkit = false;
    
    // Recursive read to find .py files
    const scanDir = (dir: string) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                scanDir(fullPath);
            } else if (file.endsWith('.py')) {
                pyFiles.push(path.relative(tempFolder, fullPath).replace(/\\/g, '/'));
            } else if (file.toLowerCase() === 'requirements.txt') {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.toLowerCase().includes('sparkit')) {
                    hasSparkit = true;
                }
            }
        }
    };

    scanDir(tempFolder);
    return { tempFolder, pyFiles, hasSparkit };
}

export async function setupScriptEnvironment(tempFolder: string, finalFolder: string, mainFile: string): Promise<{ schema: any, venvPath: string }> {
    // 1. Move tempFolder to finalFolder
    if (!fs.existsSync(finalFolder)) {
        fs.mkdirSync(path.dirname(finalFolder), { recursive: true });
    }
    
    // Ensure finalFolder doesn't exist already (should be handled by UUID but anyway)
    if (fs.existsSync(finalFolder)) {
        fs.rmSync(finalFolder, { recursive: true, force: true });
    }
    fs.renameSync(tempFolder, finalFolder);

    const venvPath = path.join(finalFolder, 'venv');
    const pythonExe = process.platform === 'win32' ? path.join(venvPath, 'Scripts', 'python.exe') : path.join(venvPath, 'bin', 'python');
    const pipExe = process.platform === 'win32' ? path.join(venvPath, 'Scripts', 'pip.exe') : path.join(venvPath, 'bin', 'pip');

    // 2. Create venv (Try python then python3)
    try {
        await execAsync(`python -m venv "${venvPath}"`);
    } catch {
        await execAsync(`python3 -m venv "${venvPath}"`);
    }

    // 3. Install requirements if present
    let reqPath: string | null = null;
    const scanDirReq = (dir: string) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                // Ignore the virtual environment folder we just created
                if (file !== 'venv') {
                    scanDirReq(fullPath);
                }
            } else if (file.toLowerCase() === 'requirements.txt') {
                reqPath = fullPath;
            }
        }
    };
    scanDirReq(finalFolder);

    if (reqPath && fs.existsSync(reqPath)) {
        await execAsync(`"${pipExe}" install -r "${reqPath}"`);
    }

    // 4. Get schema
    const mainFilePath = path.join(finalFolder, mainFile);
    
    // We no longer inject a local SDK path. The script MUST have sparkit in requirements.txt
    // as verified during the inspection step.
    const { stdout } = await execAsync(`"${pythonExe}" "${mainFilePath}" --schema`);
    
    let schemaResult = { schema: { inputs: [], outputs: [] } };
    try {
        schemaResult = JSON.parse(stdout);
    } catch(err) {
        throw new Error(`Failed to parse schema from script stdout. Stdout: ${stdout}`);
    }

    return { schema: schemaResult.schema, venvPath };
}

export async function runPythonScript(scriptFolder: string, mainFile: string, venvPath: string, inputPayload: any): Promise<any> {
    const pythonExe = process.platform === 'win32' ? path.join(venvPath, 'Scripts', 'python.exe') : path.join(venvPath, 'bin', 'python');
    const mainFilePath = path.join(scriptFolder, mainFile);

    // We can pass the JSON input via `--input` flag payload formatted as a string.
    // Or we write it to a temp file and use `--input-file`. Using temp file avoids quote escapism issues.
    const tempInputFile = path.join(os.tmpdir(), `spark-edge_input_${crypto.randomUUID()}.json`);
    fs.writeFileSync(tempInputFile, JSON.stringify(inputPayload), 'utf8');

    try {
        const { stdout } = await execAsync(`"${pythonExe}" "${mainFilePath}" --input-file "${tempInputFile}"`);
        try {
            const result = JSON.parse(stdout);
            return result;
        } catch(e) {
            return { stdout: null, stderr: { type: 'ParseError', message: stdout } };
        }
    } catch(err: any) {
        return { stdout: null, stderr: err.stderr || err.message };
    } finally {
        if (fs.existsSync(tempInputFile)) fs.unlinkSync(tempInputFile);
    }
}

