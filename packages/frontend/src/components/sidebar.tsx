import React from 'react';
import { Code, FileText, History, Package, LogOut } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader, SidebarRail } from './ui/sidebar';
import { NavMain } from './nav-main';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from './ui/button';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction } from './ui/sidebar';
import { useNavigate } from 'react-router-dom';

const data = [
    { url: '/workflow', icon: <Code size={40} color='white'/>, title: 'Instâncias' },
    { url: '/script-hub', icon: <Package size={40} color='white'/>, title: 'Script Hub' },
    { url: '/data', icon: <FileText size={40} color='white'/>, title: 'Dados' },
    { url: '/history', icon: <History size={40} color='white'/>, title: 'Histórico' },
];
export default function SideBar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await logout();
        navigate('/login');
    }

    const initials = React.useMemo(() => {
        const name = user?.first_name ?? user?.email ?? '';
        const parts = name.split(/\s+/).filter(Boolean);
        if (parts.length === 0) return '';
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }, [user]);

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
            <SidebarContent className='h-full overflow-hidden'>
                <NavMain items={data} />

                    <div className="mt-auto">
                <SidebarGroup className=''>

                    <SidebarMenu>
                        <SidebarMenuItem className=''>
                            <SidebarMenuButton tooltip={user ? (user.first_name ?? user.email) : 'Not signed'} onClick={() => navigate('/profile') } className="h-14 hover:bg-secondary-foreground">
                                <span className='w-8 h-8 rounded-full bg-primary-foreground flex items-center justify-center text-background font-semibold text-sm select-none'>
                                    {initials}
                                </span>
                                <span className='text-primary'>{user?.first_name ?? user?.email}</span>
                            </SidebarMenuButton>
                            <SidebarMenuAction title='Sign out'  aria-label='Sign out' onClick={handleSignOut} className='w-8 text-primary hover:bg-foreground/70 hover:text-primary'>
                                <LogOut color='white' />
                            </SidebarMenuAction>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
                    </div>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
};