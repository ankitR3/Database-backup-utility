'use client'

import { usePathname } from 'next/navigation';
import ThemeToggle from '../common/ThemeToggle';

export default function Navbar() {
    const pathname = usePathname();

    const titleMap: Record<string, string> = {
        '/dashboard': 'Dashboard',
        '/dashboard/backups': 'Backups',
        '/dashboard/scheduler': 'Scheduler',
        '/dashboard/stats': 'Stats',
        '/dashboard/settings': 'Settings',
    }

    const title = titleMap[pathname] || 'Dashboard'

    return (
        <header className='flex items-center justify-between px-8 py-4 bg-gray-300 dark:bg-[#12121E] text-gray-900 dark:text-gray-100'>

            {/* Page Title */}
            <h1 className='text-2xl font-semibold'>{title}</h1>

            {/* Right Area */}
            <div className='flex items-center gap-4'>
                <ThemeToggle />
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    A
                </div>
            </div>
        </header>
    )
}