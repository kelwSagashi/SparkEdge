import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CodeInstanceReturningValues } from "@nmg8/db/src/services/db.service.d";
import { useEffect, useState } from "react";

export default function ScriptSelector() {
    const [selection, setSelection] = useState<CodeInstanceReturningValues>();
    const [codeInstances, setCodeInstances] = useState<CodeInstanceReturningValues[]>([
        {
            author: "system",
            created_at: Date.now().toString(),
            updated_at: Date.now().toString(),
            name: "test",
            description: "",
            id: "1",
            language: "python",
            main_file_name: "app.py",
            path: "",
            source: "system_repo",
            entry_fn: null,
            repo: null,
            url: null,
            version: "1"
        }
    ]);

    return (
        <div className='w-full'>
            <span className="font-medium text-muted-foreground">Escolha o Script</span>
            <Select onValueChange={(val) => {
                const selectedServer = codeInstances.find(s => s.id === val);
                if (selectedServer) setSelection(selectedServer);
            }}>
                <SelectTrigger className="w-full p-6">
                    <SelectValue placeholder="Selecionar um servidor" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Scripts</SelectLabel>
                        {codeInstances.map(item => (
                            <SelectItem key={item.id} id={item.id} value={item.id} className='w-full justify-start p-6'>
                                <div className="text-left">
                                    <p className="font-semibold text-primary">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.author}</p>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}