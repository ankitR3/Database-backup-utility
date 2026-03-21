import { useCallback, useEffect, useState } from 'react';
import BackupButton from './BackupButton';
import BackupHistory from './BackupHistory';
import BackupStatsCard from './BackupStatsCard';
import { BackupConfig } from '@/src/types/backup.types';
import axios from 'axios';
import { BACKUP_CONFIGS_URL } from '@/routes/api-routes';
import { useSession } from 'next-auth/react';
import Spinner from '@repo/ui/Spinner';

export default function BackupBase() {
    const{ data: session, status } = useSession();
    const token = session?.user?.token as string;
    const [configs, setConfigs] = useState<BackupConfig[]>([]);
    const [configsLoaded, setConfigsLoaded] = useState(false);
    const [statsLoaded, setStatsLoaded] = useState(false);

    const allLoaded = configsLoaded && statsLoaded;

    const handleStatsLoaded = useCallback(() => {
        setStatsLoaded(true);
    }, []);

    useEffect(() => {
        if (status === 'loading') {
            return;
        }

        if (status !== 'authenticated' || !token) {
            setConfigsLoaded(true);
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
                setConfigsLoaded(true);
            }
        }

        fetchConfigs();
    }, [status, token]);

    if (status === 'loading' || !allLoaded) {
        return (
            <>
                {status === 'authenticated' && token && (
                    <div className='hidden'>
                        <BackupStatsCard onLoaded={handleStatsLoaded}/>
                    </div>
                )}
                <div className='flex justify-center items-center py-20 w-full h-full'>
                    <Spinner />
                </div>
            </>
        )
    }

    return (
        <div className='space-y-6'>
            <BackupStatsCard onLoaded={handleStatsLoaded} />

            {configs.length === 0 ? (
                <p className='text-gray-400'>
                    No backup configurations yet.
                </p>
            ) : (
                configs.map(config => {
                    const dbName = config.mongoDbName || config.pgDbName;
                    return (
                        <div
                            key={config.id}
                            className='bg-[#2B2B28] p-5 rounded-xl space-y-4'
                        >
                            <div>
                                <p className='text-lg font-semibold capitalize'>
                                    {config.type} - {dbName}
                                </p>
                                <div className='mt-3'>
                                    <BackupButton configId={config.id} />
                                </div>
                            </div>
                            <BackupHistory configId={config.id} />
                        </div>
                    );
                })
            )}
        </div>
    );
}