import { useEffect, useState } from 'react';
import BackupButton from './BackupButton';
import BackupHistory from './BackupTable';
import BackupStatsCard from './BackupStatsCard';

import { BackupConfig } from '@/src/types/backup.types';
import axios from 'axios';
import { BACKUP_CONFIGS_URL } from '@/routes/api-routes';
import { useSession } from 'next-auth/react';

export default function BackupBase() {
    const{ data: session, status } = useSession();
    const token = session?.user?.token as string;
    const [configs, setConfigs] = useState<BackupConfig[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status !== 'authenticated') {
            setLoading(false);
            return;
        }

        if (!token) {
            return;
        }

        async function fetchConfigs() {
            try {
                const res = await axios.get(BACKUP_CONFIGS_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setConfigs(res.data);

            } catch (err) {
                console.log('web config fetch error: ', err);
            } finally {
                setLoading(false)
            }
        }

        fetchConfigs();
    }, [status, token]);

    if (loading) {
        return <p className='text-gray-400'>Loading backups...</p>
    }

    return (
        <div className='space-y-6'>

            <BackupStatsCard />

            {configs.length === 0 ? (
                <p className='text-gray-400'>
                    No backup configurations yet.
                </p>
            ) : (
                configs.map(config => (
                    
                    <div
                        key={config.id}
                        className='bg-[#2B2B28] p-5 rounded-xl space-y-4'
                    >
                        <BackupButton configId={config.id} />

                        <BackupHistory configId={config.id} />
                    </div>
                ))
            )}
        </div>
    );
}