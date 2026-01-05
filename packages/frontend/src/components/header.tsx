import SearchGlobal from './search_global';
import { Button } from './ui/button';
import {Settings, Bell} from 'lucide-react'
import { Separator } from './ui/separator'  ;
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 flex w-full bg-sidebar p-2 gap-4 items-center justify-between shadow-md flex-shrink-0">
            <SearchGlobal />
            <div className="flex items-center gap-4 ml-auto">
                <Button variant={"default"} size={"icon"} className='bg-background/0 hover:bg-background/50'>
                    <Settings color='white'/>
                </Button>
                <Button variant={"default"} size={"icon"} className='bg-background/0 hover:bg-background/50'>
                    <Bell color='white'/>
                </Button>
                <Button className='border-border rounded hover:bg-foreground' variant={"outline"}>
                    <span className='text-primary'>Compartilhar</span>
                </Button>
                <Separator orientation='vertical'/>
                {/* Auth button */}
                <AuthButton />
            </div>
        </header>
    );
};

function AuthButton() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    if (!user) {
        return (
            <Button className='bg-white' variant={"default"} onClick={() => navigate('/login')}>
                <span className='text-primary-foreground'>Sign In</span>
            </Button>
        );
    }

    return (
        <div className='flex items-center gap-2'>
            <span className='text-sm text-white'>{user.first_name ?? user.email}</span>
            <Button className='bg-background/0' variant={'outline'} onClick={async () => { await logout(); navigate('/login'); }}>
                Logout
            </Button>
        </div>
    );
}