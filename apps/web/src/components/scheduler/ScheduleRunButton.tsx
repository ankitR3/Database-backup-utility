'use client'

import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { BACKUP_CREATE_URL } from '@/routes/api-routes';

type Props = {
    configId: string
    enabled: boolean
}

export default function SchedulerRunButton({ configId, enabled}: Props) {
    const { data: session } = useSession();
    const token = session?.user?.token as string;
    const [loading, setLoading] = useState(false);
    
    async function handleRun() {
        if (!token) {
            return;
        }

        if (!enabled) {
            alert('Scheduler is disabled. Please enable it first.')
            return;
        }

        try {
            setLoading(true);

            await axios.post(
                BACKUP_CREATE_URL,
                { configId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            alert('Backup completed successfully')
        } catch (err: any) {
            if (err.response?.data?.message) {
                alert(err.response.data.message);
            } else {
                alert('Backup failed')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleRun}
            disabled={loading}
            className='bg-blue-600 px-4 rounded-md hover:bg-blue-700 hover:cursor-pointer transition'
        >
            {loading ? 'Running...' : 'Run'}
        </button>
    )
}