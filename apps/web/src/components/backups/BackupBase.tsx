import { useCallback, useEffect, useState } from 'react';
import BackupButton from './BackupButton';
import BackupHistory from './BackupHistory';
import BackupStatsCard from './BackupStatsCard';
import { BackupConfig } from '@/src/types/backup.types';
import axios from 'axios';
import { BACKUP_CONFIGS_URL } from '@/routes/api-routes';
import { useSession } from 'next-auth/react';
import Spinner from '../ui/Spinner';

export default function BackupBase() {
    const{ data: session, status } = useSession();
    const token = session?.user?.token as string;
    const [configs, setConfigs] = useState<BackupConfig[]>([]);
    const [configsLoaded, setConfigsLoaded] = useState(false);
    const [statsLoaded, setStatsLoaded] = useState(false);
    const [selectConfigId, setSelectedConfigId] = useState<string | null>(null);

    const allLoaded = configsLoaded && statsLoaded;

    const handleStatsLoaded = useCallback(() => {
        setStatsLoaded(true);
    }, []);

    useEffect(() => {
        if (status === 'loading') return;
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
                if (res.data.length > 0) {
                    setSelectedConfigId(res.data[0].id);
                }
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

    const selectedConfig = configs.find(c => c.id === selectConfigId);

    return (
        <div className='space-y-6 w-130'>
            <BackupStatsCard onLoaded={handleStatsLoaded} />

            {configs.length === 0 ? (
                <p className='text-black'>
                    No backup configurations yet.
                </p>
            ) : (
                <>
                    <div>
                        {configs.map(config => {
                            const dbName = config.mongoDbName || config.pgDbName;
                            const isSelected = config.id === selectConfigId;
                            return (
                                <button
                                    key={config.id}
                                    onClick={() => setSelectedConfigId(config.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer capitalize
                                        ${
                                            isSelected ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {config.type} -{dbName}
                                </button>
                            );
                        })}
                    </div>

                    {selectedConfig && (
                        <div className='bg-gray-100 text-black p-5 rounded-xl space-y-4 shadow-[0_0_20px_rgba(0,0,0,0.08)]'>
                            <div>
                                <p className='text-lg font-semibold capitalize'>
                                    {selectedConfig.type} - {selectedConfig.mongoDbName || selectedConfig.pgDbName}
                                </p>
                                <div className='mt-3'>
                                    <BackupButton configId={selectedConfig.id} />
                                </div>
                            </div>
                            <BackupHistory configId={selectedConfig.id} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}