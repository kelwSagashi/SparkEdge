import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { scriptsApi } from '@/rest-api-client/scripts.service';

interface AddScriptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddScriptDialog({ open, onOpenChange, onSuccess }: AddScriptDialogProps) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [inspectData, setInspectData] = useState<{ tempFolder: string, pyFiles: string[] } | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [mainFile, setMainFile] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [version, setVersion] = useState('1.0.0');

  const reset = () => {
    setStep(1);
    setFile(null);
    setInspectData(null);
    setMainFile('');
    setName('');
    setDescription('');
    setAuthor('');
    setVersion('1.0.0');
    setUploading(false);
  };

  const handleInspect = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res: any = await scriptsApi.uploadInspect(formData);
      if (res.data) {
        setInspectData(res.data);
        if (res.data.pyFiles && res.data.pyFiles.length > 0) {
            // auto select main.py if exists
            const hasMain = res.data.pyFiles.find((f:string) => f === 'main.py');
            setMainFile(hasMain || res.data.pyFiles[0]);
        }
        setStep(2);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleFinalize = async () => {
    if (!inspectData?.tempFolder || !mainFile || !name) return;
    setUploading(true);
    try {
      await scriptsApi.uploadFinalize({
        tempFolder: inspectData.tempFolder,
        mainFile,
        name,
        description,
        author,
        version
      });
      onSuccess();
      onOpenChange(false);
      reset();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
    }}>
      <DialogContent className="sm:max-w-md bg-[#09090b] border-white/[0.08]">
        <DialogHeader>
          <DialogTitle className="text-white">Adicionar Novo Script</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="flex justify-center border-2 border-dashed border-white/[0.1] rounded-xl p-8 hover:bg-white/[0.02] transition-colors relative">
               <input 
                 type="file" 
                 accept=".zip" 
                 onChange={(e) => setFile(e.target.files?.[0] || null)}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
               />
               <div className="flex flex-col items-center gap-2 pointer-events-none">
                 <UploadCloud className="w-8 h-8 text-zinc-400" />
                 <p className="text-sm font-medium text-white">
                   {file ? file.name : "Clique ou arraste o .zip do script"}
                 </p>
                 {!file && <p className="text-xs text-zinc-500">Deve conter o código Python</p>}
               </div>
            </div>
          </div>
        )}

        {step === 2 && inspectData && (
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label className="text-zinc-400">Nome do Script</Label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Ex:: Sensor Data Collector" 
                className="bg-white/[0.04] border-white/[0.1] text-white"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                 <Label className="text-zinc-400">Autor</Label>
                 <Input 
                  value={author} 
                  onChange={e => setAuthor(e.target.value)} 
                  placeholder="Nome/Empresa" 
                  className="bg-white/[0.04] border-white/[0.1] text-white"
                 />
               </div>
               <div className="grid gap-2">
                 <Label className="text-zinc-400">Versão</Label>
                 <Input 
                  value={version} 
                  onChange={e => setVersion(e.target.value)} 
                  placeholder="1.0.0" 
                  className="bg-white/[0.04] border-white/[0.1] text-white"
                 />
               </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-zinc-400">Entrypoint (Main File)</Label>
              <Select value={mainFile} onValueChange={setMainFile}>
                <SelectTrigger className="bg-white/[0.04] border-white/[0.1] text-white">
                    <SelectValue placeholder="Selecione o arquivo principal" />
                </SelectTrigger>
                <SelectContent className="bg-[#121214] border-white/[0.1]">
                    {inspectData.pyFiles.map(file => (
                        <SelectItem key={file} value={file} className="text-white focus:bg-white/[0.06]">{file}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-zinc-400">Descrição (opcional)</Label>
              <Input 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Exemplo de script..." 
                className="bg-white/[0.04] border-white/[0.1] text-white"
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center gap-2 mt-4">
            {step === 1 ? (
                <Button 
                   className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                   disabled={!file || uploading} 
                   onClick={handleInspect}
                >
                   {uploading ? 'Processando...' : 'Avançar'}
                   {!uploading && <ChevronRight className="ml-2 w-4 h-4" />}
                </Button>
            ) : (
                <div className="flex w-full gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => setStep(1)}
                        className="flex-1 bg-transparent border-white/[0.1] text-white hover:bg-white/[0.05]"
                    >
                        Voltar
                    </Button>
                    <Button 
                        onClick={handleFinalize}
                        disabled={uploading || !name || !mainFile}
                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                    >
                        {uploading ? 'Instalando...' : 'Finalizar e Instalar'}
                        {!uploading && <CheckCircle2 className="ml-2 w-4 h-4" />}
                    </Button>
                </div>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
