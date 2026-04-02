'use client'

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { BACKUP_HISTORY_URL } from '@/routes/api-routes';
import axios from 'axios';
import Spinner from '../ui/Spinner';

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
    onRunStart?: (fn: () => void) => void
}

export default function BackupHistory({ configId, onRunStart }: Props) {
    const { data: session } = useSession();
    const token = session?.user?.token as string;

    const [data, setData] = useState<History[]>([]);
    const [expanded, setExpanded] = useState(false);
    const[loading, setLoading] = useState(true);
    const cancelledRef = useRef(false);
    const latestCreatedAt = useRef<string | null>(null);

    const visibleBackups = expanded ? data : data.slice(0, Math.min(3, data.length));

    useEffect(() => {
        if (!token) return;
        cancelledRef.current = false;
        
        async function poll() {
            try {
                setLoading(true);
                const res = await axios.get(
                    `${BACKUP_HISTORY_URL}/${configId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                if (!cancelledRef.current) {
                    setData(res.data);
                    setLoading(false);
                    if (res.data.length > 0) {
                        latestCreatedAt.current = res.data[0].createdAt;
                    }
                }
            } catch (err) {
                console.error('Initial fetch failed: ', err);
                if (!cancelledRef.current) {
                    setLoading(false);
                }
                return;
            }
            
            while(!cancelledRef.current) {
                try {
                    const since = latestCreatedAt.current ?? new Date().toISOString();
                    const res = await axios.get(
                        `${BACKUP_HISTORY_URL}/${configId}?since=${since}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );
                    
                    if (!cancelledRef.current && res.data.length > 0) {
                        setData(prev => {
                            const existingIds = new Set(prev.map(item => item.id));
                            const newItems = res.data.filter((item: History) => !existingIds.has(item.id));
                            if (newItems.length === 0) return prev;
                            const updated = [...newItems, ...prev];
                            latestCreatedAt.current = updated[0].createdAt;
                            return updated;
                        });
                    }
                } catch (err) {
                    if (!cancelledRef.current) {
                        console.error('Long poll failed: ', err);
                        await new Promise(r => setTimeout(r, 3000));
                    }
                }
            }
        }
        poll();

        return () => {
            cancelledRef.current = true;
        };
    }, [token, configId]);

    useEffect(() => {
        setExpanded(false);
    }, [configId]);

    return (
        <div className='bg-white p-4 rounded-xl mt-4 shadow-sm'>
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
                            <tr key={item.id} className='border-b border-gray-800 font-medium'>
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
                                        <span className='text-green-500 font-semibold'>Success</span>
                                    ) : (
                                        <span className='text-red-500 font-semibold'>Failed</span>
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