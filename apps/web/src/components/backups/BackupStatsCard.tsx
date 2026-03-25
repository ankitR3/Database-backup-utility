'use client'

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { BACKUP_STATUS_URL } from '@/routes/api-routes';

type Stats = {
    totalBackups: number
    totalStorage: number
    lastBackup?: {
        status: string
        createdAt: string
    }
}

type Props = {
    onLoaded: () => void
}

export default function BackupStatsCard({ onLoaded }: Props) {
    const { data: session} = useSession();
    const token = session?.user?.token as string
    const [stats, setStats] = useState<Stats | null>(null)

    useEffect(() => {
        if (!token) {
            return;
        }

        async function fetchStats() {
            try {

                const res = await axios.get(BACKUP_STATUS_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                setStats(res.data);
            } catch(err) {
                console.error('Failed to fetch stats: ', err);
            } finally {
                onLoaded();
            }
        }

        fetchStats();
    }, [token]);

    if (!stats) {
        return null;
    }

    return (
        <div className='bg-gray-200 p-5 rounded-lg mb-6 grid grid-cols-3 gap-4 w-110 shadow-md shadow-gray-300'>
            <div>
                <p className='text-black text-sm'>Total Backups</p>
                <p className='text-xl font-bold text-black'>{stats.totalBackups}</p>
            </div>

            <div>
                <p className='text-black text-sm'>Total Storage</p>
                <p className='text-xl font-bold text-black'>
                    {(stats.totalStorage / 1024 /1024).toFixed(2)} MB
                </p>
            </div>

            <div>
                <p className='text-black text-sm'> Last Backup</p>
                <p className='text-xl font-bold text-black'>
                    {stats.lastBackup ? new Date(stats.lastBackup.createdAt).toLocaleDateString() : 'N/A'}
                </p>
            </div>
        </div>
    );
}