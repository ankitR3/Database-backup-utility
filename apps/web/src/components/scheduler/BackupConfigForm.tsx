'use client'

import { useState } from 'react';
import axios from 'axios';
import { BACKUP_SCHEDULE_URL } from '@/routes/api-routes';
import { useSession } from 'next-auth/react';

type Props = {
    onSaved?: () => void;
    onClose?: () => void;
}

function detectType(uri: string): 'mongo' | 'postgres' | null {
    if (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://')) {
        return 'mongo';
    }
    if (uri.startsWith('postgresql://') || uri.startsWith('postgres://')) {
        return 'postgres';
    }
    return null;
}

export default function BackupConfigForm({ onSaved, onClose }: Props) {
    const { data: session } = useSession();
    const token = session?.user?.token as string;
    const [dbName, setDbName] = useState('');
    const [uri, setUri] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const detectedType = detectType(uri);
    const uriValid = uri === '' ? null : detectedType !== null;
    const dbNameValid = dbName === '' ? null : /^[a-zA-Z0-9_-]+$/.test(dbName);

    async function saveConfig() {
        if (!token) return;
        if (!detectedType) return;
        if (!dbNameValid) return;

        try {
            setLoading(true);
            setError('')
            await axios.post(
                BACKUP_SCHEDULE_URL, {
                    type: detectedType,
                    mongoUri: detectedType === 'mongo' ? uri : undefined,
                    mongoDbName: detectedType === 'mongo' ? dbName : undefined,
                    pgUri: detectedType === 'postgres' ? uri : undefined,
                    pgDbName: detectedType === 'postgres' ? dbName : undefined,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUri('');
            setDbName('');
            onSaved?.();

        } catch(err) {
            console.error('Database-Config-Form: ', err);
            setError('Failed to save config');
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='bg-gray-200 rounded-lg p-6 shadow-md w-[520px]'>
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-bold text-gray-800'>Backup Config</h2>
                <button
                    onClick={onClose}
                    className='text-gray-400 hover:text-gray-600 cursor-pointer text-lg leading-none'
                >
                    ✕
                </button>
            </div>

            <div className='space-y-3'>
                <div>
                    <input
                        placeholder='Database URI'
                        value={uri}
                        onChange={(e) => setUri(e.target.value)}
                        className={`w-full bg-white px-4 py-3 rounded-lg text-black outline-none transition
                            ${uriValid === null ? 'bg-white' : uriValid ? 'bg-white ring-1 ring-green-600' : 'bg-white ring-1 ring-red-600'}
                        `}
                    />
                    {uri && (
                        <p className={`text-xs mt-1 ${uriValid ? 'text-green-600' : 'text-red-600'}`}>
                            {uriValid ? detectedType : 'invalid'}
                        </p>
                    )}
                </div>

                <div>
                    <input
                        placeholder="Database Name"
                        value={dbName}
                        onChange={(e) => setDbName(e.target.value)}
                        className={`w-full bg-white px-4 py-3 rounded-lg text-black outline-none transition
                            ${dbNameValid === null ? 'bg-white' : dbNameValid ? 'bg-white ring-1 ring-green-600' : 'bg-white ring-1 ring-red-600'}
                        `}
                    />
                    {dbName && !dbNameValid && (
                        <p className='text-xs text-red-600'>
                            only letters, numbers, underscore and hypens
                        </p>
                    )}
                </div>

                {error && <p className='text-red-400'>{error}</p>}

                <button
                    onClick={saveConfig}
                    disabled={loading || !uriValid || !dbNameValid}
                    className='bg-black hover:bg-stone-800/90 transition px-5 py-2 rounded-lg text-white hover:cursor-pointer font-semibold'
                >
                    {loading ? 'Saving...' : 'Save Backup Config'}
                </button>
            </div>
        </div>
    )
}