'use client'

import { useState } from 'react';
import axios from 'axios';
import { BACKUP_SCHEDULE_URL } from '@/routes/api-routes';
import { useSession } from 'next-auth/react';

type Props = {
    type: 'mongo' | 'postgres'
}

export default function BackupConfigForm({ type }: Props) {
    const { data: session } = useSession();
    const [dbName, setDbName] = useState('');
    const [uri, setUri] = useState('');
    const [loading, setLoading] = useState(false);

    async function saveConfig() {
        try {
            if (!session?.user?.token) {
                alert('You must be logged in');
                return;
            }

            setLoading(true);

            await axios.post(
                BACKUP_SCHEDULE_URL, {
                    type,
                    mongoUri: type === 'mongo' ? uri : undefined,
                    mongoDbName: type === 'mongo' ? dbName : undefined,
                    pgUri: type === 'postgres' ? uri : undefined,
                    pgDbName: type === 'postgres' ? dbName : undefined,
                },
                {
                    headers: {
                        Authorization: `Bearer ${session.user.token}`,
                    },
                }
            );


            alert('Backup config saved!')
            setUri('')
            setDbName('')

        } catch(err) {
            console.error('Database-Config-Form: ', err);
            alert('Failed to save config')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='bg-[#1D1D29] rounded-2xl p-6 shadow-lg max-w-xl'>
            <h2 className='text-xl font-semibold text-white mb-4'>
                {type === "mongo" ? "MongoDB Backup Config" : "Postgres Backup Config"}
            </h2>
            <div className='space-y-4'>
                <input
                    placeholder='Database URI'
                    value={uri}
                    onChange={(e) => setUri(e.target.value)}
                    className='w-full bg-[#25253A] px-4 py-3 rounded-lg text-white outline-none'
                />
                <br />
                <br />

                <input
                    placeholder="Database Name"
                    value={dbName}
                    onChange={(e) => setDbName(e.target.value)}
                    className="w-full bg-[#25253A] px-4 py-3 rounded-lg text-white outline-none"
                />
                <br />
                <br />

                <button
                    onClick={saveConfig}
                    disabled={loading || !uri || !dbName}
                    className='bg-blue-600 hover:bg-blue-700 transition px-5 py-2 rounded-lg text-white'
                >
                    {loading ? 'Saving...' : 'Save Backup Config'}
                </button>
            </div>
        </div>
    )
}