'use client'

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { BACKUP_HISTORY_URL } from '@/routes/api-routes';
import axios from 'axios';
import Spinner from '@repo/ui/Spinner';

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
    const [expanded, setExpanded] = useState(false);
    const[loading, setLoading] = useState(true);

    const visibleBackups = expanded ? data : data.slice(0, Math.min(3, data.length));

    useEffect(() => {
        if (!token) {
            return;
        }

        async function init() {
            try {
                setLoading(true);
                const res = await axios.get(
                    `${BACKUP_HISTORY_URL}/${configId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                setData(res.data)
            } catch(err) {
                console.error('Initial fetch failed: ', err);
            } finally {
                setLoading(false);
            }
        }

        init()
    }, [token, configId]);

    useEffect(() => {
        setExpanded(false);
    }, [configId]);

    async function refreshHistory() {
        if(!token) {
            return;
        }

        try {
            const res = await axios.get(
                `${BACKUP_HISTORY_URL}/${configId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            setData(prev => {
                if (JSON.stringify(prev) === JSON.stringify(res.data)) {
                    return prev;
                }
                return res.data;
            })

        } catch (err) {
            console.error('Refresh failed: ', err);
        }
    }

    useEffect(() => {
        if (!token) {
            return;
        }

        const ws = new WebSocket('ws://localhost:1516');
        let isOpen = false;

        ws.onopen = () => {
            isOpen = true;
            ws.send(
                JSON.stringify({
                    type: 'SUBSCRIBE',
                    configId,
                })
            );
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data)

            if (message.type === 'BACKUP_COMPLETE') {
                console.log('Backup Complete');
                refreshHistory();
            }
        }

        ws.onerror = (err) => {
            console.log('ws error: ', err);
        }

        return () => {
            if (isOpen && ws.readyState === WebSocket.OPEN) {
                ws.send(
                    JSON.stringify({
                        type: 'UNSUBSCRIBE',
                        configId,
                    })
                );
            }
            ws.close()
        }
    }, [configId, token]);

    return (
        <div className='bg-[#1D1D29] p-4 rounded-xl mt-4'>
            <h3 className='text-lg font-semibold mb-3'>Backup History</h3>

            {loading ? (
                <div className='flex justify-center items-center py-6'>
                    <Spinner />
                </div>
            ) : data.length === 0 ? (
                <p className='text-gray-400'>No backups yet.</p>
            ) : (
                <div className='transition-all duration-300'>
                <table className='w-full text-sm'>
                    <thead>
                        <tr className='text-gray-400 border-b border-gray-700'>
                            <th className='text-left py-2 px-2'>Data</th>
                            <th className='text-left px-4'>Size</th>
                            <th className='text-left px-4'>Duration</th>
                            <th className='text-left px-4'>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {visibleBackups.map(item => (
                            <tr key={item.id} className='border-b border-gray-800'>
                                <td className='py-2 px-2'>
                                    {new Date(item.createdAt).toLocaleString()}
                                </td>

                                <td className='px-4'>
                                    {(item.size / 1024 / 1024).toFixed(2)} MB
                                </td>

                                <td className='px-4'>
                                    {(item.durationMs / 1000).toFixed(2)} sec
                                </td>

                                <td className='px-4'>
                                    {item.status === 'success' ? (
                                        <span className='text-green-400'>Success</span>
                                    ) : (
                                        <span className='text-red-400'>Failed</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {data.length > 3 && (
                    <button
                        onClick={() => setExpanded(prev => !prev)}
                        className='text-red-400 hover:text-blue-400 text-sm mt-3 hover:cursor-pointer'
                    >
                        {expanded ? 'show less' : `show more`}
                    </button>
                )}
                </div>
            )}
        </div>
    )
}