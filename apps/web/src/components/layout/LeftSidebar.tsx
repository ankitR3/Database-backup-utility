'use client'

import { DashboardEnum } from '@/src/constants/DashboardEnum';
import { useDashboardStore } from '@/src/store/useDashboardStore';
import { ChartBarIcon, ArchiveBoxIcon, ClockIcon, PresentationChartLineIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useSession, signOut } from 'next-auth/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdownMenu';
import { IconLogout, IconUser, IconChevronDown} from '@tabler/icons-react';

export default function LeftSidebar() {
    const { activeTab, setActiveTab } = useDashboardStore();
    const { data:session } = useSession();

    function handleTabChange(tab: DashboardEnum) {
        const params = new URLSearchParams(window.location.search);
        params.set('tab', tab);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
        setActiveTab(tab);
    }

    const menuItems = [
        { label: 'Dashboard', value: DashboardEnum.DASHBOARD, icon: ChartBarIcon },
        { label: 'Scheduler', value: DashboardEnum.SCHEDULER, icon: ClockIcon },
        { label: 'Backups', value: DashboardEnum.BACKUPS, icon: ArchiveBoxIcon },
        { label: 'Stats', value: DashboardEnum.STATS, icon: PresentationChartLineIcon },
        { label: 'Settings', value: DashboardEnum.SETTINGS, icon: Cog6ToothIcon },
    ]

    return (
        <aside className='w-64 h-screen bg-white border-r border-gray-200 flex flex-col px-3 py-4'>
            <div className='flex items-center gap-2 px-2 py-3 mb-4'>
                <div className='w-8 h-8 bg-black rounded-lg flex items-center justify-center'>
                    <span className='text-white text-sm font-bold'>D</span>
                </div>
                <span className='text-base font-semibold text-gray-900'>DBHaven</span>
            </div>

            <nav className='flex-1 space-y-0.5'>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = activeTab === item.value;
                    return (
                        <div
                            key={item.value}
                            onClick={() => handleTabChange(item.value)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all text-sm
                                ${active
                                    ? 'bg-gray-100 text-gray-900 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
                            `}
                        >
                            <Icon className='w-4 h-4 shrink-0' />
                            <span>{item.label}</span>
                        </div>
                    );
                })}
            </nav>

            <DropdownMenu>
                <DropdownMenuTrigger render={
                    <button className='w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all'>
                        <div className='w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center shrink-0'>
                            <span className='text-white text-xs font-medium'>
                                {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
                            </span>
                        </div>
                        <div className='flex-1 min-w-0 text-left'>
                            <p className='text-sm font-medium text-gray-900 truncate'>
                                {session?.user?.name ?? 'User'}
                            </p>
                            <p className='text-xs text-gray-500 truncate'>
                                {session?.user?.email ?? ''}
                            </p>
                        </div>
                        <IconChevronDown size={14} className='text-gray-400 shrink-0' />
                    </button>
                } />
                <DropdownMenuContent side='top' align='start' className='w-56'>
                    <DropdownMenuLabel className='font-normal'>
                        <div className='flex flex-col gap-0.5'>
                            <p className='text-sm font-medium text-gray-900'>
                                {session?.user?.name}
                            </p>
                            <p className='text-xs text-gray-500'>
                                {session?.user?.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                        <IconLogout size={14} />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </aside>
    );
}