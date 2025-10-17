import React from 'react';
import { Code, FileText, History, Package } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from './ui/sidebar';
import { NavMain } from './nav-main';

const data = [
    { url: '/workflow', icon: <Code size={40} color='white'/>, title: 'Instâncias' },
    { url: '/script-hub', icon: <Package size={40} color='white'/>, title: 'Script Hub' },
    { url: '/data', icon: <FileText size={40} color='white'/>, title: 'Dados' },
    { url: '/history', icon: <History size={40} color='white'/>, title: 'Histórico' },
];
export default function SideBar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar 
            className='border-r border-r-border/10 h-full'
            variant='sidebar' 
            collapsible="icon" 
            
            {...props}
        >
            <SidebarHeader className='flex no-underline mr-8 p-4'>
                <div className="">
                <img
                    src="../src/assets/Logo.png"
                    alt="Monitor Manager"
                    className="h-8"
                />
            </div>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data} />
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
};