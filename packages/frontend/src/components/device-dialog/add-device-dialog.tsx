import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import{ useState } from 'react';
import type { ServerReturningValues } from 'nmg8-db/src/types';
import GetService from './get-service';
import type { DeviceDialogProps } from './types';
import DeviceCreationDialog from './device-creation-dialog';

export default function AddDeviceDialog({ 
    isOpen,
    onOpenChange 
}: DeviceDialogProps) {
    const [serverSelected, setServerSelected] = useState<ServerReturningValues>();
    const [currentStep, setCurrentStep] = useState(0);
    const [saving, setSaving] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className='px-2 sm:h-auto h-auto max-w-[98%] sm:max-w-[98%] max-h-[80%] sm:max-h-[80%] flex flex-col overflow-hidden' onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader className='p-2'>
                    <DialogTitle className='px-4 text-primary'>Adicionar Dispositivo para Monitoramento</DialogTitle>
                </DialogHeader>
                <Separator />
                <div className="flex min-h-0 py-2">
                    {currentStep === 0 && <GetService setServerSelected={setServerSelected} />}
                    {currentStep === 1 && <DeviceCreationDialog onOpenChange={onOpenChange} setSaving={setSaving} serverSelected={serverSelected} />}
                </div>
                <DialogFooter className='p-2'>
                    {currentStep > 0 && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setCurrentStep(cur => cur - 1)}
                        >
                            Voltar
                        </Button>
                    )}
                    {currentStep < 1 && (<Button
                        onClick={() => setCurrentStep(cur => cur + 1)}
                    >
                        Continuar
                    </Button>)
                    }
                    {currentStep > 0 && (<Button type="submit" form='device_form' className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={saving}>
                        {saving ? 'Saving...' : 'Salvar Dispositivo'}
                    </Button>)}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}