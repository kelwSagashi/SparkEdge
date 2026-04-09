import AddDeviceDialog from "@/components/device-dialog/add-device-dialog";
import { AddInstanceButtonGroup } from "@/components/add-instance-buttons.tsx";
import AddServerDialog from "@/components/add-server-dialog";
import InstanceTable from "@/components/instance-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import ServersManagement from "./ServersManagement";
import { ServerManagementScreen } from "./ServersManagementv2";

export default function Overview() {
    const [isServerDialogOpen, setIsServerDialogOpen] = useState(false);
    const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false);
    return (
        <main className="grow px-10 py-6 w-full">
            <div className="flex flex-row justify-between">
                <div>
                    <h1 className="text-primary text-2xl">Visão Geral</h1>
                    <span className="text-primary/60">Instâncias, servidores e dispositivos criados por você.</span>
                </div>
                <div>
                    <AddInstanceButtonGroup
                        setIsDeviceDialogOpen={setIsDeviceDialogOpen}
                        setIsServerDialogOpen={setIsServerDialogOpen}
                    />
                </div>
            </div>
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
                    <TabsContent value="servers">
                        {/* <ServersManagement /> */}
                        <ServerManagementScreen />
                    </TabsContent>
                    <TabsContent value="devices">Servers</TabsContent>
                </Tabs>
            </section>
                <AddServerDialog isOpen={isServerDialogOpen} onOpenChange={setIsServerDialogOpen} />
                <AddDeviceDialog isOpen={isDeviceDialogOpen} onOpenChange={setIsDeviceDialogOpen} />
        </main >
    )
}