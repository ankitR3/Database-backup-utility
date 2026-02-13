'use client'

import axios from 'axios';
import { useState } from 'react';
import { BACKUP_CREATE_URL } from '@/routes/api-routes';
import { useSession } from 'next-auth/react';

export default function BackupButton() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);

    async function runBackup() {
        if (!session?.user?.token) {
            alert('Login required')
            return;
        }

        try {
            setLoading(true)

            await axios.post(
                BACKUP_CREATE_URL,
                {},
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
            className='bg-[#1D1D29] text-gray-200 px-5 py-2 rounded-lg hover:cursor-pointer hover:bg-gray-700'
        >
            {loading ? 'Running...' : 'Run Backup Now'}
        </button>
    )
}