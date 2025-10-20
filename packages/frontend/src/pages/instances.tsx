import { AddInstanceButtonGroup } from "@/components/add-instance-buttons.tsx";
import InstanceTable from "@/components/instance-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Instances() {
    return (
        <main className="flex-grow px-10 py-2 w-full">
            <div className="flex flex-row justify-between">
                <div>
                    <h1 className="text-primary text-2xl">Projetos</h1>
                    <span className="text-primary/60">Instâncias, servidores e dispositivos criados por você.</span>
                </div>
                <div>
                    <AddInstanceButtonGroup />
                </div>
            </div>
            <section className="mt-2">
                <div className="flex justify-between bg-secondary-foreground p-8 rounded-sm">
                    <div className="flex flex-col gap-2">
                        <span className="text-primary font-light">Espaço Usado</span>
                        <span className="text-primary font-light">704KB</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-primary font-light">Dados Pendentes</span>
                        <span className="text-primary font-light">5</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-primary font-light">Dados Enviados</span>
                        <span className="text-primary font-light">5</span>
                    </div>
                </div>
            </section>
            <section>
                <Tabs defaultValue="instances" className="py-2">
                    <TabsList>
                        <TabsTrigger value="instances">Instâncias</TabsTrigger>
                        <TabsTrigger value="servers">Servidores</TabsTrigger>
                        <TabsTrigger value="devices">Dispositivos</TabsTrigger>
                    </TabsList>
                    <TabsContent value="instances">
                        <InstanceTable/>
                    </TabsContent>
                    <TabsContent value="servers">Servers</TabsContent>
                    <TabsContent value="devices">Servers</TabsContent>
                </Tabs>
            </section>
        </main >
    )
}