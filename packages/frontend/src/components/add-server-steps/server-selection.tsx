import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';
import { DefaultServerTypes } from 'nmg8-db/src/types';
import type { ServerTypeReturningValues } from 'nmg8-db/src/types';
import { api } from '@/server/server.service';

type Props = {
  onSelect: (type: ServerTypeReturningValues | undefined) => void;
};

export default function ServerTypeSelection({ onSelect }: Props) {
  const [serverTypes, setServerTypes] = useState<ServerTypeReturningValues[]>([]);
  const [selected, setSelected] = useState<ServerTypeReturningValues>();

  useEffect(() => {
    const load = async () => {
      const response = await api.listServersTypes();
      setServerTypes(response.data.data); 
    };

    load();
  }, []);
  useEffect(() => { onSelect(selected) }, [onSelect, selected]);
  return (
    <div className="flex flex-col space-y-4 pt-4 min-w-0 w-full">
      <div>
        <span className="font-medium text-muted-foreground">Escolha o tipo de serviço</span>
        <Select onValueChange={(val) => {
          const selectedType = serverTypes.find(item => item.id === val);
          setSelected(selectedType);
        }}>
          <SelectTrigger className="w-full p-6">
            <SelectValue placeholder="Selecionar um servidor" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Servidores</SelectLabel>
              {DefaultServerTypes.map(item => (
                <SelectItem
                  key={item.id}
                  id={item.id}
                  value={item.id}
                  className='w-full justify-start p-6'
                >
                  <div className="text-left">
                    <p className="font-semibold text-primary">{item.name}</p>
                    <p className="text-sm text-muted-foreground wrap-normalbreak-words">{item.description}</p>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
