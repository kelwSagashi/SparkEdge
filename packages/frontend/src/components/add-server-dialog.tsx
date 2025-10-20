import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ServerTypeSelection from './add-server-steps/server-selection';
import ServerStepForm from './add-server-steps/server-form';
import GdriveForm from './add-server-steps/gdrive-form';
import { Separator } from './ui/separator';
import type { ServerTypeReturningValues } from '@/services/db.service.d';
import { Button } from './ui/button';

type Props = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function AddServerDialog({ isOpen, onOpenChange }: Props) {
  const [step, setStep] = useState(1);
  const [serverType, setServerType] = useState<ServerTypeReturningValues>();

  const handleServiceSelect = useCallback((type: ServerTypeReturningValues | undefined) => {
    setServerType(type);
  }, []);

  const handleNextStep = useCallback(() => {
    if (serverType) {
      setStep(val => val + 1);
    }
  }, [serverType]);

  const handlePreviousStep = useCallback(() => {
    setStep(val => val - 1);
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep(1);
        setServerType(undefined);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        // onInteractOutside={(e) => e.preventDefault()}
        className="flex flex-col w-[80vw] min-w-[80vw] sm:w-[80vw] max-h-[90vh] sm:max-h-[90vh] h-auto sm:h-auto">
        <DialogHeader>
          <DialogTitle className='text-primary'>Adicionar Novo Serviço</DialogTitle>
        </DialogHeader>
        <Separator />

        <div className="flex min-h-0 py-2">
          {step === 1 && <ServerTypeSelection onSelect={handleServiceSelect} />}

          {step === 2 && serverType && <ServerStepForm serverTypeId={serverType.id} />}

          {step === 2 && serverType?.type === 'google_drive' && <GdriveForm onBack={handlePreviousStep} onClose={handleClose} />}
        </div>

        <DialogFooter>
          <div className="flex justify-end space-x-2 pt-4">
            {step > 1 ? (
              <>
                <Button type="button" variant="ghost" onClick={handlePreviousStep}>Voltar</Button>
                <Button type="submit" form="server_form">Salvar</Button>
              </>
            ) : (
              <Button
                onClick={handleNextStep}
              >
                Continuar
              </Button>
            )}
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
