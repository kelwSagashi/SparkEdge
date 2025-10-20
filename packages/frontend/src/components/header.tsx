import SearchGlobal from './search_global';
import { Button } from './ui/button';
import {Settings, Bell} from 'lucide-react'
import { Separator } from './ui/separator'  ;

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
                <Button className='bg-white' variant={"default"}>
                    <span className='text-primary-foreground'>Sign In</span>
                </Button>
            </div>
        </header>
    );
};