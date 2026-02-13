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
        <header className='flex items-center justify-between px-8 py-4 bg-gray-300 dark:bg-[#12121E] text-gray-900 dark:text-gray-100'>

            {/* Page Title */}
            <h1 className='text-2xl font-semibold'>{title}</h1>

            {/* Right Area */}
            <div className='flex items-center gap-4'>
                <ThemeToggle />
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {content}
                </div>
            </div>
        </header>
    )
}