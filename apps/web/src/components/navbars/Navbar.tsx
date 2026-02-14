'use client'

import { usePathname } from 'next/navigation';
import ThemeToggle from '../common/ThemeToggle';
import { useSession } from 'next-auth/react';

export default function Navbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();

    const titleMap: Record<string, string> = {
        '/dashboard': 'Dashboard',
        '/dashboard/backups': 'Backups',
        '/dashboard/scheduler': 'Scheduler',
        '/dashboard/stats': 'Stats',
        '/dashboard/settings': 'Settings',
    }

    const title = titleMap[pathname] || 'Dashboard';

    let content = null;

    if (status === 'loading') {
        content = (
           <div className='w-4 h-4 bg-white/30 rounded-full animate-pulse' /> 
        )
    } else {
        const firstLetter = session?.user?.name?.charAt(0).toUpperCase() || 'U';

        content = firstLetter;
    }

    return (
        <header className='flex items-center w-screen bg-transparent fixed justify-end px-8 py-7'>

            {/* <h1 className='text-2xl text-gray-300 font-bold'>{title}</h1> */}

            <div className='flex items-center gap-4'>
                <ThemeToggle />
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {content}
                </div>
            </div>
        </header>
    )
}