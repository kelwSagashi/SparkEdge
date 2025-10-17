import { Button } from '@/components/ui/button';

type Props = {
  onBack: () => void;
  onClose: () => void;
};

export default function GdriveForm({ onBack, onClose }: Props) {

  const handleSave = () => {
    // Placeholder for saving Google Drive configuration
    console.log("Google Drive configuration saved (placeholder).");
    onClose();
  }

  return (
    <div className="space-y-4 pt-4">
        <h3 className="text-lg font-medium">2. Configurar Conexão com Google Drive</h3>
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md">
            <p className="text-muted-foreground">A interface de configuração do Google Drive será implementada aqui.</p>
            <p className="text-muted-foreground text-sm">Por enquanto, clique em salvar para continuar.</p>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="ghost" onClick={onBack}>Voltar</Button>
            <Button type="button" onClick={handleSave}>Salvar</Button>
        </div>
    </div>
  );
}
