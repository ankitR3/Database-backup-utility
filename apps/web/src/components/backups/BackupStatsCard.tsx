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

export default function BackupStatsCard() {
    const { data: session} = useSession();
    const token = session?.user?.token as string

    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!token) {
            return;
        }

        async function fetchStats() {
            try {
                setLoading(true)

                const res = await axios.get(BACKUP_STATUS_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                setStats(res.data)
            } catch(err) {
                console.error('Failed to fetch stats: ', err);
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [token])

    if (loading) {
        return null
    }

    if (!stats) {
        return null
    }

    return (
        <div className='bg-[#1D1D29] p-5 rounded-xl mb-6 grid grid-cols-3 gap-4'>
            <div>
                <p className='text-gray-400 text-sm'>Total Backups</p>
                <p className='text-xl font-bold'>{stats.totalBackups}</p>
            </div>

            <div>
                <p className='text-gray-400 text-sm'>Total Storage</p>
                <p className='text-xl font-bold'>
                    {(stats.totalStorage / 1024 /1024).toFixed(2)} MB
                </p>
            </div>

            <div>
                <p className='text-gray-400 text-sm'> Last Backup</p>
                <p className='text-xl font-bold'>
                    {stats.lastBackup ? new Date(stats.lastBackup.createdAt).toLocaleDateString() : 'N/A'}
                </p>
            </div>
        </div>
    )
}