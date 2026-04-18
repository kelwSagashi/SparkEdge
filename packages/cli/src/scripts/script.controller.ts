import { Delete, Get, Post, Put, RestController } from "@nmg8/di";
import { ScriptService } from "./script.service";
import ScriptRequest from "./script.request";
import { PythonVenvService } from "../instances/python-venv.service";
import multer from 'multer';
import { Request, Response } from "express";
import { 
    extractZipToTemp, 
    setupScriptEnvironment, 
    runPythonScript, 
    SCRIPTS_STORAGE_DIR, 
    ensureScriptsStorageDir 
} from "./script.helper";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import os from "os";

const upload = multer({ dest: path.join(os.tmpdir(), "nmg8_uploads") });

@RestController('/scripts')
export class ScriptsController {
    constructor(
        private readonly scriptService: ScriptService,
        private readonly venvService: PythonVenvService
    ) {}

    @Get('/')
    async list() {
        const result = await this.scriptService.listAll();
        return { data: result.data, error: result.error };
    }

    @Get('/:id')
    async getOne(req: ScriptRequest.IdParam) {
        const result = await this.scriptService.findById(req.params.id);
        return { data: result.data, error: result.error };
    }

    @Get('/:id/contents/:filename(*)')
    async getFileContent(req: Request, res: Response) {
        const id = req.params.id;
        const filename = req.params.filename;
        const scriptRes = await this.scriptService.findById(id);
        
        if (!scriptRes.data) {
            res.status(404).json({ error: 'Script not found' });
            return;
        }

        const localPath = (scriptRes.data as any).local_path;
        if (!localPath) {
            res.status(400).json({ error: 'Script path not found' });
            return;
        }

        const filePath = path.join(localPath, filename);
        if (!fs.existsSync(filePath)) {
            res.status(404).json({ error: 'File not found' });
            return;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        res.status(200).json({ data: content });
    }

    @Post('/')
    async create(req: ScriptRequest.Create) {
        const result = await this.scriptService.create(req.body);
        return { data: result.data, error: result.error };
    }

    @Put('/:id')
    async update(req: ScriptRequest.Update) {
        const result = await this.scriptService.update(req.params.id, req.body);
        return { data: result.data, error: result.error };
    }

    @Delete('/:id')
    async remove(req: ScriptRequest.IdParam) {
        const result = await this.scriptService.delete(req.params.id);
        return { data: result.data, error: result.error };
    }

    @Post('/upload/inspect')
    async uploadInspect(req: Request, res: Response) {
        return new Promise((resolve) => {
            upload.single('file')(req as any, res as any, async (err: any) => {
                if (err) return resolve({ error: err.message });
                if (!req.file) return resolve({ error: 'No file uploaded' });

                try {
                    const zipPath = req.file.path;
                    const { tempFolder, pyFiles, hasSparkit } = await extractZipToTemp(zipPath);
                    // remove uploaded original zip
                    fs.unlinkSync(zipPath);

                    if (!hasSparkit) {
                        // Limpar pasta temporária se não for válido
                        fs.rmSync(tempFolder, { recursive: true, force: true });
                        return res.status(400).json({ error: 'O script é inválido. É obrigatório ter um arquivo requirements.txt contendo a biblioteca "sparkit".' });
                    }

                    res.status(200).json({ data: { tempFolder, pyFiles } });
                } catch(e: any) {
                    res.status(500).json({ error: e.message });
                }
            });
        });
    }

    @Post('/upload/finalize')
    async uploadFinalize(req: Request) {
        const { tempFolder, mainFile, name, description, tags, author, version } = req.body;
        if (!tempFolder || !mainFile) return { error: 'Missing tempFolder or mainFile' };

        try {
            await ensureScriptsStorageDir();
            const finalId = crypto.randomUUID();
            const finalFolder = path.join(SCRIPTS_STORAGE_DIR, finalId);

            const { schema, venvPath } = await setupScriptEnvironment(tempFolder, finalFolder, mainFile);

            const result = await this.scriptService.create({
                id: finalId,
                name: name || 'Unnamed Script',
                description: description || '',
                author: author || 'unknown',
                version: version || '1.0.0',
                source: 'local',
                local_path: finalFolder,
                main_file: mainFile,
                venv_path: venvPath,
                venv_ready: true,
                tags: tags || [],
                schema_config: schema,
            });

            // Adicionar schema formatado a resposta
            return { data: { script: result.data, schema } };
        } catch (e: any) {
            return { error: e.message };
        }
    }

    @Get('/samples/list')
    async listSamples() {
        try {
            const samplesDir = path.resolve(__dirname, '../../../../extensions/samples');
            if (!fs.existsSync(samplesDir)) return { data: [] };
            const dirs = fs.readdirSync(samplesDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);
            return { data: dirs };
        } catch (e: any) {
            return { error: e.message };
        }
    }

    @Get('/samples/:name/schema')
    async sampleSchema(req: Request) {
        try {
            const sampleName = req.params.name;
            const sampleFolder = path.resolve(__dirname, '../../../../extensions/samples', sampleName);
            if (!fs.existsSync(sampleFolder)) return { error: 'Sample not found' };

            const venvPath = path.join(sampleFolder, 'venv');
            // Assuming it's a standard py script with nmg8py SDK
            const pythonExe = process.platform === 'win32' ? path.join(venvPath, 'Scripts', 'python.exe') : path.join(venvPath, 'bin', 'python');
            // fallback to global python if venv doesn't exist for samples to be faster
            const executable = fs.existsSync(pythonExe) ? pythonExe : 'python';
            const sdkPath = path.resolve(__dirname, '../../../../extensions/samples/nmg8_class_code/nmg8pySDK');
            const mainFile = path.join(sampleFolder, 'main.py'); // samples must have main.py

            const util = require('util');
            const exec = util.promisify(require('child_process').exec);
            const { stdout } = await exec(`"${executable}" "${mainFile}" --schema`, {
                 env: { ...process.env, PYTHONPATH: process.env.PYTHONPATH ? `${sdkPath}${path.delimiter}${process.env.PYTHONPATH}` : sdkPath }
            });

            return { data: JSON.parse(stdout).schema };
        } catch (e: any) {
            return { error: e.message };
        }
    }

    @Post('/playground/run')
    async runPlayground(req: Request) {
        const { script_id, sample_name, inputs } = req.body;
        
        try {
            if (sample_name) {
                const sampleFolder = path.resolve(__dirname, '../../../../extensions/samples', sample_name);
                // Assume there's a main.py directly
                const result = await runPythonScript(sampleFolder, 'main.py', path.join(sampleFolder, 'venv'), inputs || {});
                return { data: result };
            } else if (script_id) {
                const scriptRes = await this.scriptService.findById(script_id);
                const script = scriptRes.data;
                if (!script) return { error: 'Script not found' };

                const result = await runPythonScript(script.local_path, script.main_file, script.venv_path!, inputs || {});
                return { data: result };
            }
            return { error: 'Missing script_id or sample_name' };
        } catch (e: any) {
            return { error: e.message };
        }
    }
}