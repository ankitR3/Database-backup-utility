'use client'

import axios from 'axios';
import { useState } from 'react';
import { BACKUP_CREATE_URL } from '@/routes/api-routes';
import { useSession } from 'next-auth/react';

type Props = {
    configId: string
}

export default function BackupButton({ configId }: Props) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);

    async function runBackup() {
        if (!session?.user?.token) {
            alert('Login required')
            return;
        }

        try {
            setLoading(true)

            // console.log("Sending configId:", configId);
            await axios.post(
                BACKUP_CREATE_URL,
                { configId },
                {
                    headers: {
                        Authorization: `Bearer ${session.user.token}`,
                    },
                }
            )

            alert('Backup completed!')
        } catch (err) {
            console.error(err);
            alert('Backup failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={runBackup}
            disabled={loading}
            className='bg-white text-black px-5 py-2 rounded-lg hover:bg-red-600/50 hover:cursor-pointer shadow-sm font-semibold'
        >
            {loading ? 'Running...' : 'Run Backup Now'}
        </button>
    )
}