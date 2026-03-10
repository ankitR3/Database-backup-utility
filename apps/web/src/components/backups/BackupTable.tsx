'use client'

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { BACKUP_HISTORY_URL } from '@/routes/api-routes';
import axios from 'axios';

type History = {
    id: string
    filePath: string
    size: number
    durationMs: number
    status: 'success' | 'failed'
    createdAt: string
}

type Props = {
    configId: string
}

export default function BackupHistory({ configId }: Props) {
    const { data: session } = useSession();
    const token = session?.user?.token as string;

    const [data, setData] = useState<History[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            return;
        }

        async function fetchHistory() {
            try {
                setLoading(true)

                const res = await axios.get(
                    `${BACKUP_HISTORY_URL}/${configId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                setData(res.data)
            } catch (err) {
                console.error('Failed to fetch history: ', err);
            } finally {
                setLoading(false)
            }
        }

        fetchHistory()
    }, [configId, token])

    return (
        <div className='bg-[#1D1D29] p-4 rounded-xl mt-4'>
            <h3 className='text-lg font-semibold mb-3'>Backup History</h3>
            {loading ? (
                <p className='text-gray-400'>Loading...</p>
            ) : data.length === 0 ? (
                <p className='text-gray-400'>No backups yet.</p>
            ) : (
                <table className='w-full text-sm'>
                    <thead>
                        <tr className='text-gray-400 border-b border-gray-700'>
                            <th className='text-left py-2'>Date</th>
                            <th className='text-left'>Size</th>
                            <th className='text-left'>Duration</th>
                            <th className='text-left'>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                    {data.map(item => (
                    <tr key={item.id} className="border-b border-gray-800">
                        <td className="py-2">
                        {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td>
                        {(item.size / 1024 / 1024).toFixed(2)} MB
                        </td>
                        <td>
                        {(item.durationMs / 1000).toFixed(2)} sec
                        </td>
                        <td>
                        {item.status === 'success' ? (
                            <span className="text-green-400">Success</span>
                        ) : (
                            <span className="text-red-400">Failed</span>
                        )}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            )}
        </div>
    )
}