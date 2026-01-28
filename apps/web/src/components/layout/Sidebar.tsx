'use client'

import { ChartBarIcon, ArchiveBoxIcon, ClockIcon, Cog6ToothIcon, PresentationChartLineIcon, ArrowLeftStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const content = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: ChartBarIcon
    },
    {
        name: 'Backups',
        href: '/dashboard/backups',
        icon: ArchiveBoxIcon
    },
    {
        name: 'Scheduler',
        href: '/dashboard/scheduler',
        icon: ClockIcon
    },
    {
        name: 'Stats',
        href: '/dashboard/stats',
        icon: PresentationChartLineIcon
    },
    {
        name: 'Settings',
        href: '/dashboard/settings',
        icon: Cog6ToothIcon
    }
]

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className='w-55 h-screen'>
            <div className='h-full bg-white dark:bg-[#1D1D29] shadow-lg flex flex-col px-5 py-3'>

                {/* Logo */}
                <div className='px-3 py-5 text-gray-300 font-bold text-xl'>
                    DBHaven
                </div>

                {/* Menu */}
                <nav className='flex-1 space-y-1 mt-4'>
                    {content.map((item) => {
                        const active = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex item center gap-3 px-4 py-3 rounded-xl transition
                                    ${
                                        active
                                            ? 'bg-blue-100 text-black dark:bg-gray-300'
                                            : 'text-gray-600 hover:bg=gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <Icon className='w-5 h-5' />
                                <span className='font-medium'>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Button area */}
                <div className='p-4 border-t dark:border-gray-800'>
                    <button className='flex items-center gap-3 py-2 w-full rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition'>
                        <ArrowLeftStartOnRectangleIcon className='w-5 h-5' />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    )
}