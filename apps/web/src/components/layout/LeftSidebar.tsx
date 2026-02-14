'use client'

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardEnum } from '@/src/constants/DashboardEnum';
import { useDashboardStore } from '@/src/store/useDashboardStore';
import { ChartBarIcon, ArchiveBoxIcon, ClockIcon, PresentationChartLineIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function LeftSidebar() {
    const { activeTab, setActiveTab } = useDashboardStore();
    const searchParams = useSearchParams();

    useEffect(() => {
        const tab = searchParams.get('tab');

        if (tab && Object.values(DashboardEnum).includes(tab as DashboardEnum)) {
            setActiveTab(tab as DashboardEnum);
        }
    }, [searchParams, setActiveTab]);

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
        <aside className='w-64 h-screen bg-black text-gray-400 px-6 pt-6'>
            <div className='text-xl font-bold text-gray-300 px-10 py-3'>
                DBHaven
            </div>

            <nav>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = activeTab === item.value;

                    return (
                        <div
                            key={item.value}
                            onClick={() => handleTabChange(item.value)}
                            className={`group flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all
                                ${
                                    active ? 'bg-[#1c1515] text-white' : 'hoover-bg-[#111111] hover:text-white'
                                }
                            `}
                        >
                            <Icon
                                className={`w-5 h-5 transition-colors ${
                                    active
                                        ? 'text-white'
                                        : 'text-gray-400 group-hover:text-white'
                                    }
                                `}
                            />
                            <span className='text-base font-medium'>
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}