'use client'

import ConfigCard from '@/src/components/scheduler/ConfigCard';
import BackupConfigForm from '@/src/components/scheduler/DatabaseConfigForm';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getBackupConfigs, toggleBackup, deleteBackup } from '@/src/services/scheduler.service';
import SchedulerSkeleton from '@/src/components/scheduler/SchedulerSkeleton';
import SchedulerForm from '@/src/components/scheduler/ScheduleForm';

type BackupConfig = {
  id: string
  type: 'mongo' | 'postgres'
  enabled: boolean
  frequency?: string
  time?: string
  dayOfWeek?: number
  mongoDbName?: string
  pgDbName?: string
}

export default function SchedulerPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.token as string

  const [selectedType, setSelectedType] = useState<'mongo' | 'postgres' | null>(null);
  const [configs, setConfigs] = useState<BackupConfig[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  async function fetchConfigs() {
    if (!token) {
      return;
    }

    try {
      const data = await getBackupConfigs(token);
      setConfigs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  }

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!token) {
      setConfigs([]);
      return;
    }

    let mounted = true;

    async function load() {
      try {
        const data = await getBackupConfigs(token);
        if (mounted) {
          setConfigs(data);
        }
      } finally {
        if (mounted) {
          setInitialLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [token, status]);

  function selectHandler(type: 'mongo' | 'postgres') {
    setSelectedType(prev => (prev === type ? null : type));
  }

  async function handleToggle(id: string, enabled: boolean) {
    if (!token) return;

    setConfigs(prev =>
      prev.map(c =>
        c.id === id ? { ...c, enabled } : c
      )
    );

    await toggleBackup(token, id, enabled);
  }

  async function handleDelete(id: string) {
    if (!token) return;

    setConfigs(prev =>
      prev.filter(c =>
        c.id !== id
      )
    );

    await deleteBackup(token, id);
  }

  return (
    <div className='space-y-10'>
        <div className='grid grid-cols md:grid-cols-2 gap-7 max-w-xl'>

          <ConfigCard
            title='MongoDB backups'
            description='Configure for Mongo Backup'
            active={selectedType === 'mongo'}
            onClick={() => selectHandler('mongo')}
          />

          <ConfigCard
            title="Postgres Backups"
            description="Configure for Postgres Backup"
            active={selectedType === 'postgres'}
            onClick={() => selectHandler("postgres")}
          />

        </div>
        {selectedType && (
          <BackupConfigForm
            type={selectedType}
            onSaved={fetchConfigs}
          />
        )}

        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>Your Scheduled Backup</h2>

          {initialLoading ? (
            <SchedulerSkeleton />
          ) : configs.length === 0 ? (
            <p className='text-gray-400'>No configs yet.</p>
          ) : null}

          {configs.map(config => (
            <div key={config.id} className='bg-[#1D1D29] p-5 rounded-xl space-y-4'>
              <div className='flex justify-between items-center'>
                <div>
                  <p className='font-semibold capitalize'>
                    {config.type} - {config.mongoDbName || config.pgDbName}
                  </p>
                  <p className='text-sm text-gray-400'>
                    {config.enabled ? 'Enabled' : 'Disabled'}
                  </p>

                  {config.frequency && (
                    <p>
                      {config.frequency}
                      {config.time && ` at ${config.time}`}
                    </p>
                  )}
                </div>

                <div className='flex gap-3'>
                  <button
                    onClick={() => handleToggle(config.id, !config.enabled)}
                    className='bg-blue-600 px-4 py-2 rounded hover:cursor-pointer'
                  >
                    {config.enabled ? 'Disable' : 'Enable'}
                  </button>

                  <button
                    onClick={() => handleDelete(config.id)}
                    className='bg-red-600 px-4 py-2 rounded hover:cursor-pointer'
                  >
                    Delete
                  </button>
                </div>
              </div>

              <SchedulerForm
                configId={config.id}
                onUpdated={fetchConfigs}
              />
            </div>
          ))}
        </div>
    </div>
  )
}